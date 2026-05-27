import { useEffect, useState } from "react";
import { Head, Link, router, usePage } from "@inertiajs/react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faEnvelope,
    faPaperPlane,
    faEye,
    faEyeSlash,
    faFlag,
    faCircleCheck,
    faTriangleExclamation,
} from "@fortawesome/free-solid-svg-icons";

import { Card, CardContent } from "@/components/ui/card";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RegisterStepper } from "@/components/auth/register-stepper";
import { AuthLayout } from "@/Layouts/AuthLayout";
import { cn } from "@/lib/utils";

type Step = "email" | "sent" | "profile" | "password" | "confirm" | "complete";

type FormState = {
    name: string;
    company: string;
    phone: string;
    password: string;
    passwordConfirm: string;
};

type PageProps = {
    email: string | null;
    token: string | null;
    tokenInvalid?: boolean;
    flash?: { sent?: boolean };
    errors: Record<string, string>;
};

const INITIAL_FORM: FormState = {
    name: "",
    company: "",
    phone: "",
    password: "",
    passwordConfirm: "",
};

export default function Register() {
    const { props } = usePage<PageProps>();
    const tokenFromServer = props.token ?? null;
    const emailFromServer = props.email ?? null;

    const [step, setStep] = useState<Step>(() => {
        if (emailFromServer && tokenFromServer) return "profile";
        if (props.flash?.sent) return "sent";
        return "email";
    });
    const [email, setEmail] = useState(emailFromServer ?? "");
    const [token, setToken] = useState<string | null>(tokenFromServer);
    const [agreed, setAgreed] = useState(false);
    const [form, setForm] = useState<FormState>(INITIAL_FORM);
    const [showPassword, setShowPassword] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [emailSending, setEmailSending] = useState(false);
    const [clientErrors, setClientErrors] = useState<Record<string, string>>(
        {},
    );

    const clearClientError = (key: string) =>
        setClientErrors((prev) => {
            if (!(key in prev)) return prev;
            const next = { ...prev };
            delete next[key];
            return next;
        });

    // 新しい token が server から来たら state に取り込む
    useEffect(() => {
        if (tokenFromServer && tokenFromServer !== token) {
            setToken(tokenFromServer);
        }
        if (emailFromServer && emailFromServer !== email) {
            setEmail(emailFromServer);
        }
    }, [tokenFromServer, emailFromServer]);

    useEffect(() => {
        if (props.flash?.sent && step === "email") {
            setStep("sent");
        }
    }, [props.flash?.sent]);

    // バリデーションエラー発生時に該当の入力画面へ戻す
    useEffect(() => {
        const errs = props.errors;
        if (!errs || Object.keys(errs).length === 0) return;
        if (errs.token) {
            // token エラーは email step に戻して認証メール再送を促す
            setStep("email");
        } else if (errs.password) {
            setStep("password");
        } else if (errs.name || errs.phone || errs.company) {
            setStep("profile");
        } else if (errs.email || errs.agreed) {
            setStep("email");
        }
    }, [props.errors]);

    const stepperCurrent: 1 | 2 | 3 =
        step === "email" || step === "sent"
            ? 1
            : step === "complete"
              ? 3
              : 2;

    const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const PASSWORD_REGEX =
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#&()\-\[\]{};:',.?\/*~$^+=<>._-]).+$/;
    const PHONE_REGEX = /^[0-9]{8,15}$/;

    const validateEmail = (): Record<string, string> => {
        const errs: Record<string, string> = {};
        if (!email.trim()) errs.email = "メールアドレスを入力してください。";
        else if (!EMAIL_REGEX.test(email))
            errs.email = "メールアドレスの形式が正しくありません。";
        if (!agreed) errs.agreed = "利用規約に同意してください。";
        return errs;
    };

    const validateProfile = (): Record<string, string> => {
        const errs: Record<string, string> = {};
        if (!form.name.trim()) errs.name = "名前を入力してください。";
        if (!form.phone.trim()) errs.phone = "電話番号を入力してください。";
        else if (!PHONE_REGEX.test(form.phone))
            errs.phone =
                "電話番号はハイフンなし 8〜15 桁の数字で入力してください。";
        return errs;
    };

    const validatePassword = (): Record<string, string> => {
        const errs: Record<string, string> = {};
        if (!form.password) {
            errs.password = "パスワードを入力してください。";
        } else if (form.password.length < 6 || form.password.length > 12) {
            errs.password = "パスワードは 6〜12 文字で入力してください。";
        } else if (!PASSWORD_REGEX.test(form.password)) {
            errs.password =
                "英大文字・英小文字・数字・記号をそれぞれ 1 文字以上含めてください。";
        }
        if (!form.passwordConfirm) {
            errs.passwordConfirm =
                "パスワードの確認を入力してください。";
        } else if (form.password !== form.passwordConfirm) {
            errs.passwordConfirm = "パスワードと一致しません。";
        }
        return errs;
    };

    const sendVerificationEmail = () => {
        const errs = validateEmail();
        if (Object.keys(errs).length > 0) {
            setClientErrors(errs);
            return;
        }
        setClientErrors({});
        if (emailSending) return;
        setEmailSending(true);
        router.post(
            "/register/email",
            { email, agreed },
            {
                preserveScroll: true,
                onFinish: () => setEmailSending(false),
            },
        );
    };

    const goToPasswordStep = () => {
        const errs = validateProfile();
        if (Object.keys(errs).length > 0) {
            setClientErrors(errs);
            return;
        }
        setClientErrors({});
        setStep("password");
    };

    const goToConfirmStep = () => {
        const errs = validatePassword();
        if (Object.keys(errs).length > 0) {
            setClientErrors(errs);
            return;
        }
        setClientErrors({});
        setStep("confirm");
    };

    const submitRegistration = () => {
        if (submitting || !token) return;
        setSubmitting(true);
        router.post(
            "/register",
            {
                token,
                name: form.name,
                company: form.company,
                phone: form.phone,
                password: form.password,
                password_confirmation: form.passwordConfirm,
            },
            {
                preserveState: true,
                onFinish: () => setSubmitting(false),
            },
        );
    };

    return (
        <>
            <Head title="アカウント登録" />
            <div className="w-full max-w-3xl mx-auto">
                {props.tokenInvalid && (
                    <div className="max-w-md mx-auto mb-6 flex items-center gap-2 px-4 py-3 rounded-lg bg-destructive/10 text-destructive text-sm">
                        <FontAwesomeIcon
                            icon={faTriangleExclamation}
                            className="size-4"
                        />
                        認証リンクの有効期限が切れているか、無効です。最初からやり直してください。
                    </div>
                )}

                {step !== "complete" && step !== "sent" && (
                    <RegisterStepper current={stepperCurrent} />
                )}

                <div className="w-full max-w-md mx-auto">
                    {step === "email" && (
                        <EmailStep
                            email={email}
                            setEmail={(v) => {
                                setEmail(v);
                                clearClientError("email");
                            }}
                            agreed={agreed}
                            setAgreed={(v) => {
                                setAgreed(v);
                                clearClientError("agreed");
                            }}
                            errors={{ ...props.errors, ...clientErrors }}
                            submitting={emailSending}
                            onSubmit={sendVerificationEmail}
                        />
                    )}
                    {step === "sent" && (
                        <SentStep email={email} onResend={sendVerificationEmail} />
                    )}
                    {step === "profile" && (
                        <ProfileStep
                            email={email}
                            form={form}
                            setForm={(f) => {
                                setForm(f);
                                if (f.name !== form.name)
                                    clearClientError("name");
                                if (f.phone !== form.phone)
                                    clearClientError("phone");
                            }}
                            errors={{ ...props.errors, ...clientErrors }}
                            onNext={goToPasswordStep}
                        />
                    )}
                    {step === "password" && (
                        <PasswordStep
                            form={form}
                            setForm={(f) => {
                                setForm(f);
                                if (f.password !== form.password)
                                    clearClientError("password");
                                if (f.passwordConfirm !== form.passwordConfirm)
                                    clearClientError("passwordConfirm");
                            }}
                            errors={{ ...props.errors, ...clientErrors }}
                            onNext={goToConfirmStep}
                            onBack={() => {
                                setClientErrors({});
                                setStep("profile");
                            }}
                        />
                    )}
                    {step === "confirm" && (
                        <ConfirmStep
                            email={email}
                            form={form}
                            showPassword={showPassword}
                            onTogglePassword={() => setShowPassword((v) => !v)}
                            submitting={submitting}
                            onSubmit={submitRegistration}
                            onBack={() => setStep("password")}
                        />
                    )}
                    {step === "complete" && <CompleteStep />}
                </div>
            </div>
        </>
    );
}

Register.layout = (page: React.ReactNode) => <AuthLayout>{page}</AuthLayout>;

function EmailStep({
    email,
    setEmail,
    agreed,
    setAgreed,
    errors,
    submitting,
    onSubmit,
}: {
    email: string;
    setEmail: (v: string) => void;
    agreed: boolean;
    setAgreed: (v: boolean) => void;
    errors: Record<string, string>;
    submitting: boolean;
    onSubmit: () => void;
}) {
    return (
        <Card className="border-border/60">
            <CardContent className="px-8 py-8 space-y-5">
                <h1 className="text-center text-lg font-bold">
                    ichigo-step アカウントを作成しましょう
                </h1>
                <div className="space-y-1.5 text-center">
                    <p className="text-sm">
                        登録するメールアドレスを入力してください。
                    </p>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                        独自ドメインを利用したアドレスでメールが届かない場合
                        <br />
                        フリーメールアドレスでご登録ください。
                    </p>
                </div>

                <div className="space-y-1.5">
                    <div className="relative">
                        <FontAwesomeIcon
                            icon={faEnvelope}
                            className="size-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"
                        />
                        <Input
                            type="email"
                            placeholder="メールアドレス"
                            className="pl-10 h-11"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>
                    {errors.email && (
                        <div className="text-xs text-destructive font-medium">
                            {errors.email}
                        </div>
                    )}
                </div>

                <label className="flex items-start gap-2 text-sm cursor-pointer select-none">
                    <input
                        type="checkbox"
                        className="mt-1 size-4 accent-primary"
                        checked={agreed}
                        onChange={(e) => setAgreed(e.target.checked)}
                    />
                    <span>
                        「
                        <a
                            href="#"
                            className="text-blue-600 dark:text-blue-400 underline hover:no-underline"
                        >
                            利用規約
                        </a>
                        」および「
                        <a
                            href="#"
                            className="text-blue-600 dark:text-blue-400 underline hover:no-underline"
                        >
                            プライバシーポリシー
                        </a>
                        」に同意する
                    </span>
                </label>
                {errors.agreed && (
                    <div className="text-xs text-destructive font-medium">
                        {errors.agreed}
                    </div>
                )}

                <Button
                    type="button"
                    className="w-full h-11 rounded-full gap-2"
                    disabled={submitting}
                    onClick={onSubmit}
                >
                    <FontAwesomeIcon icon={faPaperPlane} className="size-3.5" />
                    {submitting ? "送信中..." : "認証メールを送信"}
                </Button>

                <div className="text-center text-sm text-muted-foreground">
                    すでにご登録済みの方は{" "}
                    <Link
                        href="/login"
                        className="text-blue-600 dark:text-blue-400 underline hover:no-underline"
                    >
                        ログイン
                    </Link>
                </div>
            </CardContent>
        </Card>
    );
}

function SentStep({
    email,
    onResend,
}: {
    email: string;
    onResend: () => void;
}) {
    return (
        <Card className="border-border/60">
            <CardContent className="px-8 py-12 flex flex-col items-center text-center gap-4">
                <FontAwesomeIcon
                    icon={faCircleCheck}
                    className="size-12 text-primary"
                />
                <div className="text-lg font-bold">
                    認証メールを送信しました
                </div>
                <p className="text-sm leading-relaxed">
                    <span className="font-semibold break-all">{email}</span>{" "}
                    宛にメールを送信しました。
                    <br />
                    メール内のリンクをクリックして登録を続けてください。
                </p>
                <p className="text-xs text-muted-foreground leading-relaxed">
                    メールが届かない場合は、迷惑メールフォルダもご確認ください。
                </p>
                <button
                    type="button"
                    onClick={onResend}
                    className="text-sm text-muted-foreground underline hover:no-underline mt-2"
                >
                    認証メールを再送信
                </button>
            </CardContent>
        </Card>
    );
}

function ProfileStep({
    email,
    form,
    setForm,
    errors,
    onNext,
}: {
    email: string;
    form: FormState;
    setForm: (f: FormState) => void;
    errors: Record<string, string>;
    onNext: () => void;
}) {
    return (
        <Card className="border-border/60">
            <CardContent className="px-8 py-8 space-y-5">
                <h1 className="text-center text-lg font-bold">
                    アカウント登録
                </h1>
                <div className="space-y-1">
                    <div className="text-xs text-muted-foreground">
                        メールアドレス
                    </div>
                    <div className="text-sm">{email}</div>
                </div>

                <RequiredField required>
                    <Input
                        placeholder="名前・担当者名"
                        className="h-11 pr-16"
                        value={form.name}
                        onChange={(e) =>
                            setForm({ ...form, name: e.target.value })
                        }
                    />
                </RequiredField>
                {errors.name && (
                    <div className="text-xs text-destructive font-medium">
                        {errors.name}
                    </div>
                )}

                <div className="relative">
                    <Input
                        placeholder="会社名・屋号"
                        className="h-11 pr-12"
                        value={form.company}
                        onChange={(e) =>
                            setForm({ ...form, company: e.target.value })
                        }
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 grid place-items-center size-6 rounded-md bg-muted text-muted-foreground text-xs">
                        ···
                    </span>
                </div>

                <RequiredField required>
                    <Input
                        placeholder="電話番号(ハイフンなし)"
                        inputMode="numeric"
                        className="h-11 pr-16"
                        value={form.phone}
                        onChange={(e) =>
                            setForm({ ...form, phone: e.target.value })
                        }
                    />
                </RequiredField>
                {errors.phone && (
                    <div className="text-xs text-destructive font-medium">
                        {errors.phone}
                    </div>
                )}

                <Button
                    type="button"
                    variant="outline"
                    className="w-full h-11 rounded-full border-primary text-primary font-bold"
                    onClick={onNext}
                >
                    次に進む
                </Button>
            </CardContent>
        </Card>
    );
}

function PasswordStep({
    form,
    setForm,
    errors,
    onNext,
    onBack,
}: {
    form: FormState;
    setForm: (f: FormState) => void;
    errors: Record<string, string>;
    onNext: () => void;
    onBack: () => void;
}) {

    return (
        <Card className="border-border/60">
            <CardContent className="px-8 py-8 space-y-5">
                <h1 className="text-center text-lg font-bold">
                    アカウント登録
                </h1>

                <div className="space-y-2">
                    <Label className="text-sm font-bold">パスワード</Label>
                    <div className="rounded-md bg-muted/50 px-4 py-3 text-xs leading-relaxed space-y-1">
                        <div>
                            ・英大文字・小文字・数字・記号それぞれを最低1文字ずつ含む6~12文字
                        </div>
                        <div className="break-all">
                            ・使用可能な記号 ! @ # & ( ) - [ {"{"} {"}"} ] ;
                            &apos; , . ? / * ~ $ ^ + = &lt; &gt; . _ -
                        </div>
                    </div>
                </div>

                <div className="space-y-1.5">
                    <RequiredField required>
                        <Input
                            type="password"
                            placeholder="パスワード"
                            className="h-11 pr-16"
                            value={form.password}
                            onChange={(e) =>
                                setForm({ ...form, password: e.target.value })
                            }
                        />
                    </RequiredField>
                    {errors.password && (
                        <div className="text-xs text-destructive font-medium">
                            {errors.password}
                        </div>
                    )}
                </div>

                <div className="space-y-1.5">
                    <RequiredField required>
                        <Input
                            type="password"
                            placeholder="パスワード確認用"
                            className="h-11 pr-16"
                            value={form.passwordConfirm}
                            onChange={(e) =>
                                setForm({
                                    ...form,
                                    passwordConfirm: e.target.value,
                                })
                            }
                        />
                    </RequiredField>
                    {errors.passwordConfirm && (
                        <div className="text-xs text-destructive font-medium">
                            {errors.passwordConfirm}
                        </div>
                    )}
                </div>

                <Button
                    type="button"
                    variant="outline"
                    className="w-full h-11 rounded-full border-primary text-primary font-bold"
                    onClick={onNext}
                >
                    登録内容の確認
                </Button>

                <div className="text-center">
                    <button
                        type="button"
                        onClick={onBack}
                        className="text-sm text-muted-foreground underline hover:no-underline"
                    >
                        前ページに戻る
                    </button>
                </div>
            </CardContent>
        </Card>
    );
}

function ConfirmStep({
    email,
    form,
    showPassword,
    onTogglePassword,
    submitting,
    onSubmit,
    onBack,
}: {
    email: string;
    form: FormState;
    showPassword: boolean;
    onTogglePassword: () => void;
    submitting: boolean;
    onSubmit: () => void;
    onBack: () => void;
}) {
    return (
        <Card className="border-border/60">
            <CardContent className="px-8 py-8 space-y-5">
                <h1 className="text-center text-lg font-bold">
                    アカウント登録
                </h1>

                <ConfirmRow label="メールアドレス" value={email} />
                <ConfirmRow label="名前・担当者名" value={form.name} />
                <ConfirmRow label="会社名・屋号" value={form.company || "—"} />
                <ConfirmRow label="電話番号" value={form.phone} />
                <div className="space-y-1">
                    <div className="text-xs text-muted-foreground">
                        パスワード
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                        <span className="font-mono">
                            {showPassword
                                ? form.password
                                : "•".repeat(form.password.length)}
                        </span>
                        <button
                            type="button"
                            onClick={onTogglePassword}
                            className="text-muted-foreground hover:text-foreground"
                            aria-label={
                                showPassword
                                    ? "パスワードを隠す"
                                    : "パスワードを表示"
                            }
                        >
                            <FontAwesomeIcon
                                icon={showPassword ? faEyeSlash : faEye}
                                className="size-4"
                            />
                        </button>
                    </div>
                </div>

                <Button
                    type="button"
                    variant="outline"
                    className="w-full h-11 rounded-full border-primary text-primary font-bold"
                    disabled={submitting}
                    onClick={onSubmit}
                >
                    {submitting ? "登録中..." : "アカウント登録"}
                </Button>

                <div className="text-center">
                    <button
                        type="button"
                        onClick={onBack}
                        className="text-sm text-muted-foreground underline hover:no-underline"
                    >
                        前ページに戻る
                    </button>
                </div>
            </CardContent>
        </Card>
    );
}

function CompleteStep() {
    return (
        <Card className="border-border/60">
            <CardContent className="px-8 py-12 flex flex-col items-center text-center gap-4">
                <FontAwesomeIcon
                    icon={faFlag}
                    className="size-12 text-primary"
                />
                <div className="text-lg font-bold text-primary">
                    アカウント登録完了
                </div>
                <p className="text-sm leading-relaxed">
                    アカウント登録が完了しました。
                    <br />
                    ホームに移動します...
                </p>
                <Link
                    href="/"
                    className={cn(
                        buttonVariants({ variant: "default" }),
                        "mt-2 h-11 px-12 rounded-full bg-primary text-primary-foreground hover:bg-primary/90 font-bold",
                    )}
                >
                    ホームへ
                </Link>
            </CardContent>
        </Card>
    );
}

function RequiredField({
    required,
    children,
}: {
    required?: boolean;
    children: React.ReactNode;
}) {
    return (
        <div className="relative">
            {children}
            {required && (
                <span
                    className={cn(
                        "absolute right-3 top-1/2 -translate-y-1/2",
                        "inline-flex items-center justify-center text-[10px] font-bold",
                        "px-1.5 py-0.5 rounded bg-destructive/10 text-destructive",
                    )}
                >
                    必須
                </span>
            )}
        </div>
    );
}

function ConfirmRow({ label, value }: { label: string; value: string }) {
    return (
        <div className="space-y-1">
            <div className="text-xs text-muted-foreground">{label}</div>
            <div className="text-sm break-all">{value}</div>
        </div>
    );
}
