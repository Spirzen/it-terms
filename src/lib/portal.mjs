import {loadEcosystemConfig, buildNavItems, resolvePortalBase} from './ecosystem.mjs';

export function getPortalContext() {
  const config = loadEcosystemConfig({dev: import.meta.env.DEV});
  return {
    config,
    navItems: buildNavItems(config, 'terms'),
    brandHref: `${resolvePortalBase(config, 'terms')}/glossary/intro`,
    brandLabel: 'Глоссарий IT',
    ecosystemConfigJson: JSON.stringify({
      postMessage: config.postMessage,
      domains: config.domains,
    }),
  };
}
