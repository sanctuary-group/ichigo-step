import { Head, router, useForm } from "@inertiajs/react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus, faXmark } from "@fortawesome/free-solid-svg-icons";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { DashboardLayout } from "@/Layouts/DashboardLayout";
import {
    FIELD_TYPE_LABELS,
    type FriendField,
    type FriendFieldFolder,
    type FriendFieldRunMode,
    type FriendFieldType,
} from "@/types/data-management";

const MAX_NAME = 20;

type FolderOption = Pick<FriendFieldFolder, "id" | "name" | "is_system">;

type PageProps = {
    field: FriendField | null;
    folders: FolderOption[];
    defaultFolderId: number | null;
};

export default function FriendFieldForm({
    field,
    folders,
    defaultFolderId,
}: PageProps) {
    const isEdit = !!field;

    const form = useForm({
        name: field?.name ?? "",
        friend_field_folder_id:
            field?.friend_field_folder_id ?? defaultFolderId ?? 0,
        field_type: (field?.field_type ?? "choice") as FriendFieldType,
        run_mode: (field?.run_mode ?? "once") as FriendFieldRunMode,
        options: field?.options ?? [],
    });

    const submit = () => {
        if (isEdit) {
            form.patch(`/data-management/friend-fields/${field!.id}`);
        } else {
            form.post("/data-management/friend-fields");
        }
    };

    const addOption = () =>
        form.setData("options", [...form.data.options, ""]);
    const updateOption = (i: number, v: string) =>
        form.setData(
            "options",
            form.data.options.map((o, idx) => (idx === i ? v : o)),
        );
    const removeOption = (i: number) =>
        form.setData(
            "options",
            form.data.options.filter((_, idx) => idx !== i),
        );

    return (
        <>
            <Head title={isEdit ? "友だち情報編集" : "友だち情報作成"} />
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-6">
                <h1 className="text-lg font-bold tracking-tight">
                    {isEdit ? "友だち情報編集" : "友だち情報作成"}
                </h1>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-10 gap-y-8">
                    <Section title="友だち情報（管理名）">
                        <div className="grid grid-cols-[1fr_auto] items-center gap-3">
                            <Input
                                value={form.data.name}
                                onChange={(e) =>
                                    form.setData(
                                        "name",
                                        e.target.value.slice(0, MAX_NAME),
                                    )
                                }
                                maxLength={MAX_NAME}
                                className="h-10"
                            />
                            <span className="text-xs text-muted-foreground tabular-nums whitespace-nowrap">
                                {form.data.name.length}/{MAX_NAME}文字
                            </span>
                        </div>
                        {form.errors.name && (
                            <p className="text-xs text-destructive mt-1">
                                {form.errors.name}
                            </p>
                        )}
                    </Section>

                    <Section title="フォルダ">
                        <select
                            value={form.data.friend_field_folder_id}
                            onChange={(e) =>
                                form.setData(
                                    "friend_field_folder_id",
                                    Number(e.target.value),
                                )
                            }
                            className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                        >
                            {folders.map((f) => (
                                <option key={f.id} value={f.id}>
                                    {f.name}
                                </option>
                            ))}
                        </select>
                    </Section>

                    <div className="lg:col-span-2">
                        <div className="flex items-center gap-2 mb-3 border-l-[3px] border-primary pl-2">
                            <h2 className="text-sm font-bold">
                                情報タイプ選択{" "}
                                <span className="text-red-600 dark:text-red-400 text-xs font-normal">
                                    ※保存後の変更不可
                                </span>
                            </h2>
                        </div>
                        <select
                            value={form.data.field_type}
                            onChange={(e) =>
                                form.setData(
                                    "field_type",
                                    e.target.value as FriendFieldType,
                                )
                            }
                            disabled={isEdit}
                            className="h-10 w-full sm:w-1/2 rounded-md border border-input bg-background px-3 text-sm disabled:opacity-60 disabled:cursor-not-allowed"
                        >
                            {(
                                Object.keys(
                                    FIELD_TYPE_LABELS,
                                ) as FriendFieldType[]
                            ).map((t) => (
                                <option key={t} value={t}>
                                    {FIELD_TYPE_LABELS[t]}
                                </option>
                            ))}
                        </select>
                    </div>

                    {form.data.field_type === "choice" && (
                        <div className="lg:col-span-2">
                            <Section title="選択肢">
                                <div className="space-y-2">
                                    {form.data.options.length === 0 && (
                                        <p className="text-xs text-muted-foreground">
                                            「追加」で選択肢を登録してください。
                                        </p>
                                    )}
                                    {form.data.options.map((opt, i) => (
                                        <div
                                            key={i}
                                            className="flex items-center gap-2"
                                        >
                                            <Input
                                                value={opt}
                                                onChange={(e) =>
                                                    updateOption(
                                                        i,
                                                        e.target.value,
                                                    )
                                                }
                                                placeholder={`選択肢 ${i + 1}`}
                                                maxLength={100}
                                                className="h-9 max-w-md"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => removeOption(i)}
                                                className="grid place-items-center size-8 rounded hover:bg-muted text-muted-foreground hover:text-destructive"
                                                aria-label="削除"
                                            >
                                                <FontAwesomeIcon
                                                    icon={faXmark}
                                                    className="size-3.5"
                                                />
                                            </button>
                                        </div>
                                    ))}
                                    <Button
                                        type="button"
                                        size="sm"
                                        onClick={addOption}
                                        className="bg-blue-500 hover:bg-blue-600 text-white h-9 px-5"
                                    >
                                        <FontAwesomeIcon
                                            icon={faPlus}
                                            className="size-3"
                                        />
                                        追加
                                    </Button>
                                </div>
                            </Section>
                        </div>
                    )}

                    <div className="lg:col-span-2">
                        <Section title="稼働設定">
                            <RadioGroup
                                value={form.data.run_mode}
                                onValueChange={(v) =>
                                    v &&
                                    form.setData(
                                        "run_mode",
                                        v as FriendFieldRunMode,
                                    )
                                }
                                className="flex items-center gap-6"
                            >
                                <label className="flex items-center gap-2 text-sm cursor-pointer">
                                    <RadioGroupItem value="once" />
                                    一度のみ
                                </label>
                                <label className="flex items-center gap-2 text-sm cursor-pointer">
                                    <RadioGroupItem value="repeat" />
                                    何度でも稼働
                                </label>
                            </RadioGroup>
                        </Section>
                    </div>
                </div>

                <div className="flex items-center justify-center gap-3 pt-4">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() =>
                            router.get("/data-management/friend-fields", {
                                folder:
                                    form.data.friend_field_folder_id ||
                                    undefined,
                            })
                        }
                        className="h-11 px-8"
                    >
                        キャンセル
                    </Button>
                    <Button
                        onClick={submit}
                        disabled={
                            form.processing || form.data.name.length === 0
                        }
                        className="bg-primary text-primary-foreground hover:bg-primary/90 h-11 px-16 font-bold disabled:opacity-50"
                    >
                        {form.processing ? "保存中..." : "保存"}
                    </Button>
                </div>
            </div>
        </>
    );
}

FriendFieldForm.layout = (page: React.ReactNode) => (
    <DashboardLayout>{page}</DashboardLayout>
);

function Section({
    title,
    children,
}: {
    title: string;
    children: React.ReactNode;
}) {
    return (
        <div>
            <div className="flex items-center gap-2 mb-3 border-l-[3px] border-primary pl-2">
                <h2 className="text-sm font-bold">{title}</h2>
            </div>
            <div>{children}</div>
        </div>
    );
}
