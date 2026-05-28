import type { Tag } from "@/types/chat";
import type { LineChannel } from "@/types/broadcast";

export type ScenarioTriggerType = "friend_add" | "tag_added";

export type StepTimingMode = "immediate" | "datetime" | "elapsed";

export type ScenarioStep = {
    id?: number;
    scenario_id?: number;
    step_order: number;
    delay_minutes: number;
    timing_mode: StepTimingMode;
    message_type: "text" | "image";
    text_content: string | null;
    image_url: string | null;
    image_preview_url: string | null;
};

export type ScenarioFolder = {
    id: number;
    organization_id: number;
    name: string;
    sort_order: number;
    is_system: boolean;
    scenarios_count?: number;
};

export type Scenario = {
    id: number;
    organization_id: number;
    line_channel_id: number;
    scenario_folder_id: number | null;
    name: string;
    description: string | null;
    trigger_type: ScenarioTriggerType;
    trigger_tag_id: number | null;
    is_active: boolean;
    created_at: string;
    updated_at: string;
    steps?: ScenarioStep[];
    trigger_tag?: Tag | null;
    line_channel?: LineChannel | null;
    folder?: ScenarioFolder | null;
    active_count?: number;
    completed_count?: number;
    terminated_count?: number;
};
