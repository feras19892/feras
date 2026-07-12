export interface LabItem {
  uid: string;
  id: string;
  name: string;
  icon: string;
  type: string;
  x: number;
  y: number;
}

export interface ToolDef {
  id: string;
  name: string;
  icon: string;
  type: string;
}

export interface Section {
  id: string;
  title: string;
  icon: string;
  items: ToolDef[];
}

export const glasswareSections: Section[] = [
  {
    id: 'containers',
    title: 'chemistryTools.sectionContainers',
    icon: '🧪',
    items: [
      { id: 'test-tube-sm', name: 'chemistryTools.testTubeSm', icon: '🧪', type: 'container' },
      { id: 'test-tube-md', name: 'chemistryTools.testTubeMd', icon: '🧪', type: 'container' },
      { id: 'test-tube-lg', name: 'chemistryTools.testTubeLg', icon: '🧪', type: 'container' },
      { id: 'beaker-100', name: 'chemistryTools.beaker100', icon: '🥣', type: 'container' },
      { id: 'beaker-250', name: 'chemistryTools.beaker250', icon: '🥣', type: 'container' },
      { id: 'beaker-500', name: 'chemistryTools.beaker500', icon: '🥣', type: 'container' },
      { id: 'erlenmeyer', name: 'chemistryTools.erlenmeyer', icon: '⚗️', type: 'container' },
      { id: 'volumetric-flask', name: 'chemistryTools.volumetricFlask', icon: '🏺', type: 'container' },
      { id: 'round-bottom-flask', name: 'chemistryTools.roundBottomFlask', icon: '⚗️', type: 'container' },
      { id: 'sep-funnel', name: 'chemistryTools.sepFunnel', icon: '🫗', type: 'container' },
    ],
  },
  {
    id: 'measuring',
    title: 'chemistryTools.sectionMeasuring',
    icon: '📏',
    items: [
      { id: 'burette', name: 'chemistryTools.burette', icon: '🧴', type: 'measuring' },
      { id: 'pipette', name: 'chemistryTools.pipette', icon: '💉', type: 'measuring' },
      { id: 'volumetric-pipette', name: 'chemistryTools.volumetricPipette', icon: '📐', type: 'measuring' },
      { id: 'grad-cylinder', name: 'chemistryTools.gradCylinder', icon: '📏', type: 'measuring' },
    ],
  },
  {
    id: 'devices',
    title: 'chemistryTools.sectionDevices',
    icon: '📟',
    items: [
      { id: 'bunsen-burner', name: 'chemistryTools.bunsenBurner', icon: '🔥', type: 'device' },
      { id: 'heating-mantle', name: 'chemistryTools.heatingMantle', icon: '🧣', type: 'device' },
      { id: 'hot-plate', name: 'chemistryTools.hotPlate', icon: '🔘', type: 'device' },
      { id: 'digital-balance', name: 'chemistryTools.digitalBalance', icon: '⚖️', type: 'device' },
      { id: 'ph-meter', name: 'chemistryTools.phMeter', icon: '📟', type: 'device' },
      { id: 'thermometer-mercury', name: 'chemistryTools.thermometerMercury', icon: '🌡️', type: 'device' },
      { id: 'thermometer-digital', name: 'chemistryTools.thermometerDigital', icon: '📟', type: 'device' },
    ],
  },
  {
    id: 'helpers',
    title: 'chemistryTools.sectionHelpers',
    icon: '🛠️',
    items: [
      { id: 'retort-stand-assembly', name: 'chemistryTools.retortStandAssembly', icon: '🏗️', type: 'helper' },
      { id: 'test-tube-rack', name: 'chemistryTools.testTubeRack', icon: '🧮', type: 'helper' },
      { id: 'spatula', name: 'chemistryTools.spatula', icon: '🥄', type: 'helper' },
      { id: 'watch-glass', name: 'chemistryTools.watchGlass', icon: '🔍', type: 'helper' },
      { id: 'filter-funnel', name: 'chemistryTools.filterFunnel', icon: '🔽', type: 'helper' },
      { id: 'rubber-stopper', name: 'chemistryTools.rubberStopper', icon: '⬛', type: 'helper' },
    ],
  },
];

