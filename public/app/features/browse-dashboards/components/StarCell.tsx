import { type CellProps } from 'react-table';

import { config } from '@grafana/runtime';
import { StarToolbarButton } from 'app/features/stars/StarToolbarButton';

import { type DashboardsTreeItem } from '../types';

export function StarCell({ row: { original: data } }: CellProps<DashboardsTreeItem, unknown>) {
  const item = data.item;

  // Folder starring only works through the app platform stars API. The legacy fallback in
  // useStarItem only supports dashboards, so hide the button when that API isn't available.
  if (item.kind !== 'folder' || !config.featureToggles.starsFromAPIServer) {
    return null;
  }

  return <StarToolbarButton group="folder.grafana.app" kind="Folder" id={item.uid} title={item.title} hideSpinner />;
}
