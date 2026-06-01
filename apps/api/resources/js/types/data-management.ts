export type FriendFieldType =
    | "choice"
    | "text"
    | "number"
    | "date"
    | "phone"
    | "email";

export type FriendFieldRunMode = "once" | "repeat";

export const FIELD_TYPE_LABELS: Record<FriendFieldType, string> = {
    choice: "選択肢",
    text: "テキスト",
    number: "数値",
    date: "日付",
    phone: "電話番号",
    email: "メール",
};

export type FriendFieldFolder = {
    id: number;
    name: string;
    sort_order: number;
    is_system: boolean;
    friend_fields_count?: number;
};

export type FriendField = {
    id: number;
    organization_id: number;
    friend_field_folder_id: number | null;
    name: string;
    field_type: FriendFieldType;
    options: string[] | null;
    run_mode: FriendFieldRunMode;
    sort_order: number;
    values_count?: number;
    created_at: string;
    updated_at: string;
};

export type CsvKind = "export" | "import";

export type CsvJob = {
    id: number;
    organization_id: number;
    kind: CsvKind;
    name: string;
    audience: "active" | "blocked" | "blockedBy" | null;
    columns: string[] | null;
    target_count: number;
    condition_label: string | null;
    file_path: string | null;
    original_filename: string | null;
    row_count: number;
    status: "pending" | "processing" | "completed" | "failed";
    created_at: string;
    updated_at: string;
};
