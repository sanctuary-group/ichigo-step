<?php

namespace App\Support;

/**
 * リッチメニューの定型レイアウト定義（唯一の情報源）。
 *
 * LINE のリッチメニュー画像サイズ:
 *   large   = 2500 x 1686
 *   compact = 2500 x 843
 *
 * areas のピクセル座標は画像サイズと正確にタイル状に並ぶように定義する。
 * フロント側はこの定義を受け取りグリッドのオーバーレイを描画する。
 */
class RichMenuLayouts
{
    public const SIZES = [
        'large' => ['width' => 2500, 'height' => 1686],
        'compact' => ['width' => 2500, 'height' => 843],
    ];

    /**
     * @return array<int, array{key: string, label: string, size: string, width: int, height: int, areas: array<int, array{x:int,y:int,width:int,height:int}>}>
     */
    public static function all(): array
    {
        return [
            self::layout('large_6', '大: 6分割 (3×2)', 'large', [
                [0, 0, 833, 843], [833, 0, 834, 843], [1667, 0, 833, 843],
                [0, 843, 833, 843], [833, 843, 834, 843], [1667, 843, 833, 843],
            ]),
            self::layout('large_4', '大: 4分割 (2×2)', 'large', [
                [0, 0, 1250, 843], [1250, 0, 1250, 843],
                [0, 843, 1250, 843], [1250, 843, 1250, 843],
            ]),
            self::layout('large_3v', '大: 3分割 (縦)', 'large', [
                [0, 0, 833, 1686], [833, 0, 834, 1686], [1667, 0, 833, 1686],
            ]),
            self::layout('large_2v', '大: 2分割 (縦)', 'large', [
                [0, 0, 1250, 1686], [1250, 0, 1250, 1686],
            ]),
            self::layout('large_2h', '大: 2分割 (横)', 'large', [
                [0, 0, 2500, 843], [0, 843, 2500, 843],
            ]),
            self::layout('large_1', '大: 1面', 'large', [
                [0, 0, 2500, 1686],
            ]),
            self::layout('compact_3', '小: 3分割 (縦)', 'compact', [
                [0, 0, 833, 843], [833, 0, 834, 843], [1667, 0, 833, 843],
            ]),
            self::layout('compact_2', '小: 2分割 (縦)', 'compact', [
                [0, 0, 1250, 843], [1250, 0, 1250, 843],
            ]),
            self::layout('compact_1', '小: 1面', 'compact', [
                [0, 0, 2500, 843],
            ]),
        ];
    }

    /**
     * @return array{key: string, label: string, size: string, width: int, height: int, areas: array<int, array{x:int,y:int,width:int,height:int}>}|null
     */
    public static function find(string $key): ?array
    {
        foreach (self::all() as $layout) {
            if ($layout['key'] === $key) {
                return $layout;
            }
        }

        return null;
    }

    public static function keys(): array
    {
        return array_map(fn ($l) => $l['key'], self::all());
    }

    /**
     * @param  array<int, array{0:int,1:int,2:int,3:int}>  $areas
     */
    private static function layout(string $key, string $label, string $size, array $areas): array
    {
        return [
            'key' => $key,
            'label' => $label,
            'size' => $size,
            'width' => self::SIZES[$size]['width'],
            'height' => self::SIZES[$size]['height'],
            'areas' => array_map(fn ($a) => [
                'x' => $a[0], 'y' => $a[1], 'width' => $a[2], 'height' => $a[3],
            ], $areas),
        ];
    }
}
