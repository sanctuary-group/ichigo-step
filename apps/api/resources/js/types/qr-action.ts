export type QrAudience = "new" | "all";
export type QrActionType = "none" | "add_tag" | "start_scenario" | "track_source";

export type QrActionFolder = {
    id: number;
    name: string;
    sort_order: number;
    is_system: boolean;
    qr_actions_count?: number;
};

export type QrAction = {
    id: number;
    organization_id: number;
    line_channel_id: number | null;
    qr_action_folder_id: number | null;
    token: string;
    name: string;
    audience: QrAudience;
    action_type: QrActionType;
    action_tag_id: number | null;
    action_scenario_id: number | null;
    is_active: boolean;
    scan_count: number;
    follow_count: number;
    public_url?: string;
    image_url?: string;
    action_tag?: { id: number; name: string; color: string } | null;
    action_scenario?: { id: number; name: string } | null;
    created_at: string;
    updated_at: string;
};
