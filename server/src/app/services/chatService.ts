import fastify, { FastifyInstance } from "fastify";
import { ORM } from "../types/orm";
import { UserService } from "./userService";
import { conversationSchema } from "../types/chat";
import { userProfile } from "../types/member";
import { SocketEvent } from "../types/socket";
import { messageSchema } from "../schemas/orm/chatSchemas";

export class ChatService {
    private orm: ORM;
    private app: FastifyInstance;
    private userService: UserService;

    constructor(fastify: FastifyInstance) {
        this.orm = fastify.orm;
        this.app = fastify;
        this.userService = new UserService(fastify);
    }

    async getConversationId(id: number, meId: number) {
        const [conversation] = await this.orm.query(
            `SELECT * FROM conversations
        WHERE id IN (
            SELECT conversation_id FROM conversation_participants
            WHERE user_id = $1
        )
        AND id IN (
            SELECT conversation_id FROM conversation_participants
            WHERE user_id = $2
        )`,
            [id, meId]
        );

        return conversation;
    }

    async createConversation(id: number, meId: number) {
        const conversation = await this.getConversationId(id, meId);

        const users = await Promise.all([
            this.userService.getUserById(id),
            this.userService.getUserById(meId),
        ]);

        if (conversation) {
            return {
                id: conversation.id,
                users: users,
            };
        }

        if (!(await this.userService.userConnectedTo(id, meId))) {
            throw new Error("User is not connected");
        }

        const result = await this.orm.query(
            `INSERT INTO conversations (created_at) VALUES (NOW()) RETURNING *`
        );
        
        const newConversation = result[0];

        await this.orm.query(
            `INSERT INTO conversation_participants (conversation_id, user_id) VALUES ($1, $2), ($1, $3)`,
            [newConversation.id, id, meId]
        );

        return {
            id: newConversation.id,
            users: users,
        };
    }

    async getUnreadMessagesCount(meId: number) {
        const conversations = await this.orm.query(
            `SELECT * FROM conversations
        WHERE id IN (
            SELECT conversation_id FROM conversation_participants
            WHERE user_id = $1
        )`,
            [meId]
        );

        if (!conversations) return 0;

        let messages = (
            await Promise.all(
                conversations.map(
                    async (conversation: { id: number }) =>
                        await this.orm.query(
                            `SELECT * FROM conversation_messages WHERE conversation_id = $1 AND sender_id != $2 AND read = FALSE`,
                            [conversation.id, meId]
                        )
                )
            )
        ).flat();

        return messages.length;
    }

    async readConversation(conversationId: number, meId: number) {
        try {
            await this.orm.query(
                `UPDATE conversation_messages SET read = TRUE WHERE conversation_id = $1 AND sender_id != $2`,
                [conversationId, meId]
            );

            const result: {
                user_id: number;
                conversation_id: number;
                id: number;
            }[] = await this.orm.query(
                `SELECT * FROM conversation_participants WHERE conversation_id = $1`,
                [conversationId]
            );

            const user = result
                .map((conv) => conv.user_id)
                .filter((user_id) => user_id !== meId)[0];

            this.app.sendsSocket([user.toString()], {
                event: SocketEvent.messageRead,
                data: {
                    id: conversationId,
                },
            });

            return true;
        } catch (error) {
            throw new Error("Failed to read messages");
        }
    }

    async getMessages(
        conversationId: number,
        meId: number,
        limit: number | null = null
    ) {
        const messages: any = await this.orm.query(
            `SELECT * FROM conversation_messages WHERE conversation_id = $1 ORDER BY sent_at DESC ${
                limit ? `LIMIT ${limit}` : ""
            }`,
            [conversationId]
        );

        if (!messages)
            return {
                total: 0,
                messages: [],
            };

        const usersID = [
            ...new Set(
                messages.map(
                    (message: { sender_id: number }) => message.sender_id
                )
            ),
        ];

        const users: userProfile[] = await Promise.all(
            usersID.map(
                async (id) => await this.userService.getUserById(id as number)
            )
        );

        return {
            total: messages.length,
            messages: messages.map((message: any) => ({
                id: message.id,
                conversationId: parseInt(message.conversation_id),
                sender: users.find((user) => user.id === message.sender_id),
                content: message.content,
                read: message.read,
                sentAt: message.sent_at,
            })),
        };
    }

    async getConversation(
        id: number,
        meId: number
    ): Promise<conversationSchema> {
        const [conversation] = await this.orm.query(
            `SELECT * FROM conversations
        WHERE id IN (
            SELECT conversation_id FROM conversation_participants
            WHERE user_id = $1
        )
        AND id = $2`,
            [meId, id]
        );

        if (!conversation) {
            throw new Error("Conversation not found");
        }

        const participants = await this.orm.query(
            `SELECT * FROM conversation_participants WHERE conversation_id = $1`,
            [id]
        );

        const users = await Promise.all(
            participants.map(
                async (participant) =>
                    await this.userService
                        .getUserById(participant.user_id)
                        .catch(() => ({
                            id: participant.user_id,
                            username: "Unknown",
                            avatar: null,
                            firstName: "Deleted",
                            lastName: "User",
                            age: 0,
                            gender: null,
                            biography: null,
                            sexualOrientation: null,
                            pictures: [],
                            tags: [],
                        }))
            )
        );

        return {
            id: conversation.id,
            users: users,
            lastMessage: await this.getMessages(id, meId, 1).then(
                (messages) => messages.messages[0] || null
            ),
        };
    }

    async createMessage(
        conversationId: number,
        userId: number,
        content: string
    ) {
        const conversation = await this.getConversation(conversationId, userId);

        if (!conversation) {
            throw new Error("Conversation not found");
        }

        if (
            !(await this.userService.userConnectedTo(
                conversation.users[0].id,
                conversation.users[1].id
            ))
        )
            throw new Error("User is not connected");

        const result = await this.orm.query(
            `INSERT INTO conversation_messages (conversation_id, sender_id, content, sent_at, read) VALUES ($1, $2, $3, NOW(), false) RETURNING *`,
            [conversationId, userId, content]
        );

        if (!result.length) throw new Error("Failed to send message");

        this.app.sendsSocket(
            conversation.users.map((user) => user.id.toString()),
            {
                event: SocketEvent.messageCreate,
                data: {
                    type: "Message",
                    id: result[0].id,
                    conversationId: conversationId,
                    sender: conversation.users.find(
                        (user) => user.id === userId
                    ),
                    content: content,
                    sentAt: result[0].sent_at,
                },
            }
        );

        return {
            id: result[0].id,
            conversationId: conversationId,
            sender: conversation.users.find((user) => user.id === userId),
            content: content,
            sentAt: result[0].sent_at,
        };
    }

    async getConversations(meId: number) {
        const conversations = await this.orm.query(
            `SELECT * FROM conversations
        WHERE id IN (
            SELECT conversation_id FROM conversation_participants
            WHERE user_id = $1
        )`,
            [meId]
        );

        if (!conversations)
            return {
                total: 0,
                conversations: [],
            };

        return {
            total: conversations.length,
            conversations: await Promise.all(
                conversations.map(
                    async (conversation: { id: number }) =>
                        await this.getConversation(conversation.id, meId)
                )
            ),
        };
    }
}
