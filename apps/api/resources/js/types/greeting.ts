export type GreetingType = "new_friend" | "existing" | "unblock";

export type GreetingActionType =
    | "tag_attach"
    | "tag_detach"
    | "scenario_start";

export type GreetingAction = {
    type: GreetingActionType;
    tag_id?: number | null;
    scenario_id?: number | null;
};

export type Greeting = {
    id?: number;
    organization_id?: number;
    line_channel_id: number;
    type: GreetingType;
    is_active: boolean;
    message_type: "text" | "image";
    text_content: string | null;
    image_url: string | null;
    image_preview_url: string | null;
    actions: GreetingAction[];
};
