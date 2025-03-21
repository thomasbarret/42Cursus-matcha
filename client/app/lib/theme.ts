import {
    ActionIcon,
    Button,
    Card,
    createTheme,
    Image,
    Input,
    Menu,
    Modal,
    NavLink,
    Notification,
    NumberInput,
    Paper,
    Pill,
    Select,
    TagsInput,
    Textarea,
    TextInput,
} from "@mantine/core";
import { DatePickerInput } from "@mantine/dates";
import { Dropzone } from "@mantine/dropzone";

const primaryColor = "grape";

export const theme = createTheme({
    fontFamily: "Geist, serif",
    primaryColor: primaryColor,
    components: {
        Button: Button.extend({
            defaultProps: {
                radius: "md",
            },
        }),
        Paper: Paper.extend({
            defaultProps: {
                radius: "xs",
            },
        }),
        Card: Card.extend({
            defaultProps: {
                radius: "lg",
            },
        }),
        Input: Input.extend({
            defaultProps: {
                radius: "lg",
            },
        }),
        TextInput: TextInput.extend({
            defaultProps: {
                radius: "lg",
            },
        }),
        NumberInput: NumberInput.extend({
            defaultProps: {
                radius: "lg",
            },
        }),
        Textarea: Textarea.extend({
            defaultProps: {
                radius: "lg",
            },
        }),
        Select: Select.extend({
            defaultProps: {
                radius: "lg",
            },
        }),
        TagsInput: TagsInput.extend({
            defaultProps: {
                radius: "lg",
                color: "grape",
            },
        }),
        Image: Image.extend({
            defaultProps: {
                radius: "lg",
            },
        }),
        NavLink: NavLink.extend({
            styles: {
                root: {
                    borderRadius: "var(--mantine-radius-md)",
                },
            },
        }),
        Notification: Notification.extend({
            defaultProps: {
                radius: "lg",
                withBorder: true,
            },
        }),
        Dropzone: Dropzone.extend({
            defaultProps: {
                radius: "lg",
            },
        }),
        Modal: Modal.extend({
            defaultProps: {
                radius: "lg",
            },
        }),
        Menu: Menu.extend({
            defaultProps: {
                radius: "md",
            },
        }),
        Pill: Pill.extend({
            defaultProps: {
                bg: primaryColor,
            },
        }),
        ActionIcon: ActionIcon.extend({
            defaultProps: {
                radius: "md",
            },
        }),
        DatePickerInput: DatePickerInput.extend({
            defaultProps: {
                radius: "lg",
            },
        }),
    },
});
