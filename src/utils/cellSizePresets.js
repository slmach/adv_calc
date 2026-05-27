/** Пресеты размера ячейки, от которой считается дисклеймер */
export const CELL_SIZE_PRESETS = [
  { id: '1744x60', width: 1744, height: 60, label: '1744×60' },
  { id: '1190x60', width: 1190, height: 60, label: '1190×60' },
  { id: '604x80', width: 604, height: 80, label: '604×80' },
  { id: '550x60', width: 550, height: 60, label: '550×60' },
];

export function findCellSizePreset(width, height) {
  return CELL_SIZE_PRESETS.find(
    (preset) => preset.width === width && preset.height === height,
  )?.id;
}
