import { usePage } from "@inertiajs/react";

/**
 * 管理画面の秘密ベースパス（例: "/ops-9f2k7m"）。
 * サーバーが管理パス配下のリクエストのときだけ共有するため、
 * 利用者ページの JS バンドルには秘密パスが含まれない。
 */
export function useAdminBase(): string {
    const { props } = usePage<{ adminBase?: string | null }>();
    return props.adminBase ?? "";
}
