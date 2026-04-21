import fitz
import math

# --- НАСТРОЙКИ ---
INPUT_FILE = "input.pdf"  # Исходный файл (A5 или A6)
OUTPUT_FILE = "output_sra3.pdf"  # Готовый файл для печати

# Размеры листа SRA3 в миллиметрах (обычно подается широкой стороной)
SRA3_W_MM = 450.0
SRA3_H_MM = 320.0

GUTTER_MM = 4.0  # Расстояние между страницами (вылеты/корешок)
MARK_LEN_MM = 5.0  # Длина метки реза
MARK_OFFSET_MM = 1.0  # Отступ метки от угла страницы

MM2PT = 2.83465


def draw_crop_marks(page, x, y, w, h):
    offset = MARK_OFFSET_MM * MM2PT
    length = MARK_LEN_MM * MM2PT

    color = (0, 0, 0)
    width = 0.5  # Толщина линии

    # Левый верхний угол
    page.draw_line((x - offset, y), (x - offset - length, y), color=color, width=width)
    page.draw_line((x, y - offset), (x, y - offset - length), color=color, width=width)

    # Правый верхний угол
    page.draw_line((x + w + offset, y), (x + w + offset + length, y), color=color, width=width)
    page.draw_line((x + w, y - offset), (x + w, y - offset - length), color=color, width=width)

    # Левый нижний угол
    page.draw_line((x - offset, y + h), (x - offset - length, y + h), color=color, width=width)
    page.draw_line((x, y + h + offset), (x, y + h + offset + length), color=color, width=width)

    # Правый нижний угол
    page.draw_line((x + w + offset, y + h), (x + w + offset + length, y + h), color=color, width=width)
    page.draw_line((x + w, y + h + offset), (x + w, y + h + offset + length), color=color, width=width)


def main():
    doc_in = fitz.open(INPUT_FILE)
    doc_out = fitz.open()

    rect_in = doc_in[0].rect
    page_w = rect_in.width
    page_h = rect_in.height

    sra3_w = SRA3_W_MM * MM2PT
    sra3_h = SRA3_H_MM * MM2PT
    gutter = GUTTER_MM * MM2PT

    cols = int((sra3_w + gutter) // (page_w + gutter))
    rows = int((sra3_h + gutter) // (page_h + gutter))

    cols_rot = int((sra3_h + gutter) // (page_w + gutter))
    rows_rot = int((sra3_w + gutter) // (page_h + gutter))
    if (cols_rot * rows_rot) > (cols * rows):
        sra3_w, sra3_h = sra3_h, sra3_w
        cols, rows = cols_rot, rows_rot

    pages_per_sheet_side = cols * rows
    print(f"Формат сетки: {cols} колонок x {rows} строк ({pages_per_sheet_side} стр. на сторону)")

    if pages_per_sheet_side == 0:
        print("Ошибка: Страница исходника больше, чем лист SRA3!")
        return

    # --- ЛОГИКА CUT & STACK ---
    total_pages = len(doc_in)
    pages_per_slot = math.ceil(total_pages / (pages_per_sheet_side * 2)) * 2
    total_slots = pages_per_sheet_side

    needed_pages = pages_per_slot * total_slots
    while len(doc_in) < needed_pages:
        doc_in.new_page(width=page_w, height=page_h)

    print(f"Всего исходных страниц (с учетом добивки пустыми): {len(doc_in)}")
    print(f"Будет сгенерировано печатных сторон: {needed_pages // pages_per_sheet_side}")

    block_w = cols * page_w + (cols - 1) * gutter
    block_h = rows * page_h + (rows - 1) * gutter
    start_x = (sra3_w - block_w) / 2
    start_y = (sra3_h - block_h) / 2

    total_sides = needed_pages // pages_per_sheet_side
    for _ in range(total_sides):
        doc_out.new_page(width=sra3_w, height=sra3_h)

    # Раскладываем страницы
    for i in range(len(doc_in)):
        slot = i // pages_per_slot
        pos_in_slot = i % pages_per_slot

        sheet_side_idx = pos_in_slot
        is_back_side = (sheet_side_idx % 2 != 0)

        col = slot % cols
        row = slot // cols

        if is_back_side:
            actual_col = (cols - 1) - col
        else:
            actual_col = col

        actual_row = row

        x = start_x + actual_col * (page_w + gutter)
        y = start_y + actual_row * (page_h + gutter)

        target_rect = fitz.Rect(x, y, x + page_w, y + page_h)

        out_page = doc_out[sheet_side_idx]
        out_page.show_pdf_page(target_rect, doc_in, i)


        if pos_in_slot == 0 or pos_in_slot == 1:
            pass

        draw_crop_marks(out_page, x, y, page_w, page_h)

    doc_out.save(OUTPUT_FILE, garbage=4, deflate=True)
    doc_out.close()
    doc_in.close()
    print(f"Готово! Файл сохранен как {OUTPUT_FILE}")


if __name__ == "__main__":
    main()