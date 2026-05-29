import { Head, useForm } from "@inertiajs/react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircleCheck, faLock } from "@fortawesome/free-solid-svg-icons";
import { FormEvent } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { StrawberryIcon } from "@/components/strawberry-icon";
import type { FormFieldType } from "@/types/form";

type PublicField = {
    id: number;
    label: string;
    type: FormFieldType;
    options: string[];
    required: boolean;
};

type PageProps = {
    form: {
        title: string;
        description: string | null;
        submit_message: string | null;
        token: string;
    };
    fields: PublicField[];
    closed: boolean;
    submitted: boolean;
};

export default function PublicFormShow({
    form: model,
    fields,
    closed,
    submitted,
}: PageProps) {
    const initialAnswers: Record<string, string | string[]> = {};
    for (const f of fields) {
        initialAnswers[f.id] = f.type === "checkbox" ? [] : "";
    }

    const form = useForm<{ answers: Record<string, string | string[]> }>({
        answers: initialAnswers,
    });
    const errors = form.errors as Record<string, string>;

    const setAnswer = (id: number, value: string | string[]) => {
        form.setData("answers", { ...form.data.answers, [String(id)]: value });
    };

    const toggleCheckbox = (id: number, opt: string) => {
        const cur = (form.data.answers[String(id)] as string[]) ?? [];
        const next = cur.includes(opt)
            ? cur.filter((o) => o !== opt)
            : [...cur, opt];
        setAnswer(id, next);
    };

    const onSubmit = (e: FormEvent) => {
        e.preventDefault();
        form.post(`/f/${model.token}`);
    };

    return (
        <>
            <Head title={model.title} />
            <div className="min-h-screen bg-muted/40 py-8 px-4">
                <div className="mx-auto w-full max-w-xl">
                    <div className="flex items-center justify-center gap-2 mb-6 text-muted-foreground">
                        <StrawberryIcon className="size-5" />
                        <span className="text-sm font-bold">ichigo-step</span>
                    </div>

                    {closed ? (
                        <div className="bg-background rounded-xl border border-border p-10 text-center space-y-3">
                            <FontAwesomeIcon
                                icon={faLock}
                                className="size-10 text-muted-foreground/40"
                            />
                            <h1 className="text-lg font-bold">
                                受付を終了しました
                            </h1>
                            <p className="text-sm text-muted-foreground">
                                このフォームは現在回答を受け付けていません。
                            </p>
                        </div>
                    ) : submitted ? (
                        <div className="bg-background rounded-xl border border-border p-10 text-center space-y-3">
                            <FontAwesomeIcon
                                icon={faCircleCheck}
                                className="size-12 text-emerald-500"
                            />
                            <h1 className="text-lg font-bold">送信完了</h1>
                            <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                                {model.submit_message ||
                                    "ご回答ありがとうございました。"}
                            </p>
                        </div>
                    ) : (
                        <form
                            onSubmit={onSubmit}
                            className="bg-background rounded-xl border border-border overflow-hidden"
                        >
                            <div className="border-t-4 border-primary p-6 space-y-2">
                                <h1 className="text-xl font-bold">{model.title}</h1>
                                {model.description && (
                                    <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                                        {model.description}
                                    </p>
                                )}
                            </div>

                            <div className="px-6 pb-6 space-y-6">
                                {fields.map((field) => (
                                    <div key={field.id} className="space-y-1.5">
                                        <label className="text-sm font-medium flex items-center gap-1.5">
                                            {field.label}
                                            {field.required && (
                                                <span className="text-[10px] font-bold text-white bg-red-500 rounded px-1.5 py-0.5">
                                                    必須
                                                </span>
                                            )}
                                        </label>

                                        {(field.type === "text" ||
                                            field.type === "email" ||
                                            field.type === "number" ||
                                            field.type === "date") && (
                                            <Input
                                                type={
                                                    field.type === "email"
                                                        ? "email"
                                                        : field.type === "number"
                                                          ? "number"
                                                          : field.type === "date"
                                                            ? "date"
                                                            : "text"
                                                }
                                                value={
                                                    (form.data.answers[
                                                        String(field.id)
                                                    ] as string) ?? ""
                                                }
                                                onChange={(e) =>
                                                    setAnswer(
                                                        field.id,
                                                        e.target.value,
                                                    )
                                                }
                                                className="h-10"
                                            />
                                        )}

                                        {field.type === "textarea" && (
                                            <Textarea
                                                value={
                                                    (form.data.answers[
                                                        String(field.id)
                                                    ] as string) ?? ""
                                                }
                                                onChange={(e) =>
                                                    setAnswer(
                                                        field.id,
                                                        e.target.value,
                                                    )
                                                }
                                                rows={4}
                                            />
                                        )}

                                        {field.type === "select" && (
                                            <select
                                                value={
                                                    (form.data.answers[
                                                        String(field.id)
                                                    ] as string) ?? ""
                                                }
                                                onChange={(e) =>
                                                    setAnswer(
                                                        field.id,
                                                        e.target.value,
                                                    )
                                                }
                                                className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm"
                                            >
                                                <option value="">
                                                    選択してください
                                                </option>
                                                {field.options.map((o, i) => (
                                                    <option key={i} value={o}>
                                                        {o}
                                                    </option>
                                                ))}
                                            </select>
                                        )}

                                        {field.type === "radio" && (
                                            <div className="space-y-1.5">
                                                {field.options.map((o, i) => (
                                                    <label
                                                        key={i}
                                                        className="flex items-center gap-2 text-sm cursor-pointer"
                                                    >
                                                        <input
                                                            type="radio"
                                                            name={`field_${field.id}`}
                                                            checked={
                                                                form.data.answers[
                                                                    String(field.id)
                                                                ] === o
                                                            }
                                                            onChange={() =>
                                                                setAnswer(field.id, o)
                                                            }
                                                            className="accent-primary"
                                                        />
                                                        {o}
                                                    </label>
                                                ))}
                                            </div>
                                        )}

                                        {field.type === "checkbox" && (
                                            <div className="space-y-1.5">
                                                {field.options.map((o, i) => (
                                                    <label
                                                        key={i}
                                                        className="flex items-center gap-2 text-sm cursor-pointer"
                                                    >
                                                        <input
                                                            type="checkbox"
                                                            checked={(
                                                                (form.data.answers[
                                                                    String(field.id)
                                                                ] as string[]) ?? []
                                                            ).includes(o)}
                                                            onChange={() =>
                                                                toggleCheckbox(
                                                                    field.id,
                                                                    o,
                                                                )
                                                            }
                                                            className="accent-primary"
                                                        />
                                                        {o}
                                                    </label>
                                                ))}
                                            </div>
                                        )}

                                        {errors[`answers.${field.id}`] && (
                                            <p className="text-xs text-destructive">
                                                {errors[`answers.${field.id}`]}
                                            </p>
                                        )}
                                    </div>
                                ))}

                                <Button
                                    type="submit"
                                    disabled={form.processing}
                                    className="w-full h-11 bg-primary text-primary-foreground hover:bg-primary/90 font-bold"
                                >
                                    {form.processing ? "送信中..." : "送信する"}
                                </Button>
                            </div>
                        </form>
                    )}

                    <p className="text-center text-[11px] text-muted-foreground mt-6">
                        Powered by ichigo-step
                    </p>
                </div>
            </div>
        </>
    );
}
