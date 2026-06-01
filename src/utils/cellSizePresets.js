/** Пресеты размера ячейки, от которой считается дисклеймер */
export const CELL_SIZE_PRESETS = [
  { id: '1788x60', width: 1788, height: 60, label: '1788' },
  { id: '1360x60', width: 1360, height: 60, label: '1360' },
  { id: '1190x60', width: 1190, height: 60, label: '1190' },
  { id: '604x80', width: 604, height: 80, label: '604' },
  { id: '550x60', width: 550, height: 60, label: '550' },
];

export const DEFAULT_CELL_SIZE_PRESET_ID = '1190x60';

export function getDefaultCellSizePreset() {
  return (
    CELL_SIZE_PRESETS.find((preset) => preset.id === DEFAULT_CELL_SIZE_PRESET_ID) ??
    CELL_SIZE_PRESETS[0]
  );
}

export function findCellSizePreset(width, height) {
  return CELL_SIZE_PRESETS.find(
    (preset) => preset.width === width && preset.height === height,
  )?.id;
}
