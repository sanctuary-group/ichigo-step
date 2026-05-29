export type FormFieldType =
    | "text"
    | "textarea"
    | "radio"
    | "checkbox"
    | "select"
    | "email"
    | "number"
    | "date";

export type FormFieldData = {
    id?: number;
    label: string;
    type: FormFieldType;
    options: string[];
    required: boolean;
    sort_order?: number;
};

export type FormFolder = {
    id: number;
    name: string;
    sort_order: number;
    is_system: boolean;
    forms_count?: number;
};

export type FormStatus = "draft" | "published" | "closed";
export type FormType = "standard" | "survey" | "reservation";

export type FormModel = {
    id: number;
    organization_id: number;
    form_folder_id: number | null;
    token: string;
    name: string;
    title: string;
    description: string | null;
    form_type: FormType;
    status: FormStatus;
    submit_message: string | null;
    fields?: FormFieldData[];
    fields_count?: number;
    responses_count?: number;
    public_url?: string;
    created_at: string;
    updated_at: string;
};

export type FormResponseRow = {
    id: number;
    form_id: number;
    friend_id: number | null;
    answers: {
        field_id: number;
        label: string;
        type: FormFieldType;
        value: string | string[] | null;
    }[];
    submitted_at: string;
    friend?: {
        id: number;
        display_name: string | null;
        system_display_name: string | null;
    } | null;
};
