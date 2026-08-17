export const isAcid = (id: string) => ['hcl', 'h2so4', 'hno3', 'ch3cooh'].includes(id);
export const isBase = (id: string) => ['naoh', 'koh', 'nh4oh', 'nh3'].includes(id);
export const isIndicator = (id: string) => ['phenolphthalein', 'methyl-orange', 'bromothymol-blue', 'universal-indicator', 'starch'].includes(id);
