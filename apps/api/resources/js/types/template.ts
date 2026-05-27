export type TemplateFolder = {
    id: number;
    organization_id: number;
    name: string;
    sort_order: number;
    is_system: boolean;
    templates_count?: number;
};

export type Template = {
    id: number;
    organization_id: number;
    template_folder_id: number | null;
    name: string;
    content: string;
    created_at: string;
    updated_at: string;
};
