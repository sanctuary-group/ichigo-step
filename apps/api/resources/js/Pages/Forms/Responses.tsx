import { Head, Link } from "@inertiajs/react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronLeft, faInbox } from "@fortawesome/free-solid-svg-icons";

import { DashboardLayout } from "@/Layouts/DashboardLayout";
import type { FormModel, FormFieldData, FormResponseRow } from "@/types/form";

type PageProps = {
    form: FormModel;
    fields: FormFieldData[];
    responses: FormResponseRow[];
};

function formatDateTime(iso: string): string {
    const d = new Date(iso);
    const p = (n: number) => n.toString().padStart(2, "0");
    return `${d.getFullYear()}/${p(d.getMonth() + 1)}/${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}`;
}

function renderValue(value: string | string[] | null): string {
    if (value === null || value === "") return "—";
    if (Array.isArray(value)) return value.length ? value.join(", ") : "—";
    return value;
}

export default function FormResponses({ form, fields, responses }: PageProps) {
    return (
        <>
            <Head title={`${form.name} の回答`} />
            <div className="flex-1 flex flex-col h-full overflow-hidden">
                <div className="px-4 sm:px-6 lg:px-8 pt-5 pb-3 border-b border-border">
                    <Link
                        href="/forms"
                        className="text-xs text-muted-foreground hover:text-foreground hover:underline inline-flex items-center gap-1.5 mb-1"
                    >
                        <FontAwesomeIcon icon={faChevronLeft} className="size-2.5" />
                        フォーム一覧へ戻る
                    </Link>
                    <div className="flex items-center justify-between gap-3 flex-wrap">
                        <h1 className="text-lg font-bold tracking-tight">
                            {form.name}{" "}
                            <span className="text-muted-foreground font-normal text-sm">
                                の回答
                            </span>
                        </h1>
                        <div className="flex items-center gap-3">
                            <span className="text-sm text-muted-foreground">
                                合計{" "}
                                <span className="font-bold text-foreground tabular-nums">
                                    {responses.length}
                                </span>{" "}
                                件
                            </span>
                            <Link
                                href={`/forms/${form.id}/edit`}
                                className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
                            >
                                フォームを編集
                            </Link>
                        </div>
                    </div>
                </div>

                <div className="flex-1 overflow-auto">
                    {responses.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-24 gap-2 text-muted-foreground">
                            <FontAwesomeIcon
                                icon={faInbox}
                                className="size-14 text-muted-foreground/30"
                            />
                            <div className="text-sm">まだ回答がありません</div>
                            {form.status !== "published" && (
                                <div className="text-xs">
                                    フォームを公開すると回答を受け付けられます
                                </div>
                            )}
                        </div>
                    ) : (
                        <table className="w-full text-sm">
                            <thead className="bg-muted/60 sticky top-0">
                                <tr>
                                    <th className="px-3 py-2 text-left font-bold text-foreground w-40 whitespace-nowrap">
                                        回答日時
                                    </th>
                                    {fields.map((f, i) => (
                                        <th
                                            key={i}
                                            className="px-3 py-2 text-left font-bold text-foreground whitespace-nowrap"
                                        >
                                            {f.label}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {responses.map((r) => {
                                    const byField = new Map(
                                        r.answers.map((a) => [a.field_id, a.value]),
                                    );
                                    return (
                                        <tr
                                            key={r.id}
                                            className="border-b border-border hover:bg-muted/30 align-top"
                                        >
                                            <td className="px-3 py-3 text-xs text-muted-foreground tabular-nums whitespace-nowrap">
                                                {formatDateTime(r.submitted_at)}
                                            </td>
                                            {fields.map((f, i) => (
                                                <td
                                                    key={i}
                                                    className="px-3 py-3 text-sm whitespace-pre-wrap break-words max-w-xs"
                                                >
                                                    {renderValue(
                                                        f.id != null
                                                            ? (byField.get(
                                                                  f.id,
                                                              ) as
                                                                  | string
                                                                  | string[]
                                                                  | null) ?? null
                                                            : null,
                                                    )}
                                                </td>
                                            ))}
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        </>
    );
}

FormResponses.layout = (page: React.ReactNode) => (
    <DashboardLayout>{page}</DashboardLayout>
);
