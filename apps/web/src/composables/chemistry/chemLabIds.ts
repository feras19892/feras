export function isBeaker(id: string): boolean { return id.startsWith('beaker'); }
export function isTestTube(id: string): boolean { return id.startsWith('test-tube'); }
export function isBurette(id: string): boolean { return id === 'burette'; }
export function isPipette(id: string): boolean { return id === 'pipette' || id === 'volumetric-pipette'; }
export function isErlenmeyer(id: string): boolean { return id === 'erlenmeyer'; }
export function isVolumetricFlask(id: string): boolean { return id === 'volumetric-flask'; }
export function isRoundBottomFlask(id: string): boolean { return id === 'round-bottom-flask'; }
export function isSeparatoryFunnel(id: string): boolean { return id === 'sep-funnel'; }
export function isGradCylinder(id: string): boolean { return id === 'grad-cylinder'; }
export function isHeatingMantle(id: string): boolean { return id === 'heating-mantle'; }
export function isBunsenBurner(id: string): boolean { return id === 'bunsen-burner'; }
export function isBalance(id: string): boolean { return id === 'digital-balance'; }
export function isPhMeter(id: string): boolean { return id === 'ph-meter'; }
export function isWatchGlass(id: string): boolean { return id === 'watch-glass'; }
export function isFilterFunnel(id: string): boolean { return id === 'filter-funnel'; }
export function isRubberStopper(id: string): boolean { return id === 'rubber-stopper'; }
export function isThermometer(id: string): boolean { return id === 'thermometer-mercury' || id === 'thermometer-digital'; }

export function isContainer(id: string): boolean {
  return isBeaker(id) || isTestTube(id) || id === 'erlenmeyer' || id === 'grad-cylinder'
    || id === 'volumetric-flask' || id === 'round-bottom-flask' || id === 'sep-funnel';
}

export function getMaxVolume(id: string): number {
  if (id === 'beaker-100') return 100;
  if (id === 'beaker-250') return 250;
  if (id === 'beaker-500') return 500;
  if (id === 'erlenmeyer') return 300;
  if (id === 'volumetric-flask') return 250;
  if (id === 'round-bottom-flask') return 250;
  if (id === 'sep-funnel') return 250;
  if (id === 'grad-cylinder') return 100;
  if (id === 'test-tube-sm') return 15;
  if (id === 'test-tube-md') return 25;
  if (id === 'test-tube-lg') return 50;
  return 250;
}
