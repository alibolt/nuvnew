// Container block settings groups for better organization
export const containerBlockGroups = {
  layout: ['layout', 'columnRatio', 'mobileLayout'],
  spacing: ['gap', 'mobileGap', 'padding'],
  alignment: ['alignment', 'verticalAlignment'],
  sizing: ['maxWidth', 'marginTop', 'marginBottom'],
  style: ['backgroundColor', 'borderRadius', 'border']
};

export const getContainerSettingsGroups = (settings: Record<string, any>) => {
  const groups: Record<string, any[]> = {
    layout: [],
    spacing: [],
    alignment: [],
    sizing: [],
    style: []
  };
  
  Object.entries(settings).forEach(([key, setting]) => {
    // Find which group this setting belongs to
    for (const [groupName, groupKeys] of Object.entries(containerBlockGroups)) {
      if (groupKeys.includes(key)) {
        groups[groupName].push({ key, ...setting });
        break;
      }
    }
  });
  
  // Filter out empty groups
  return Object.entries(groups)
    .filter(([_, settings]) => settings.length > 0)
    .reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {});
};