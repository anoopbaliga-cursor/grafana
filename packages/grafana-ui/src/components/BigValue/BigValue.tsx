import { css, cx } from '@emotion/css';
import { memo, useState } from 'react';
import tinycolor from 'tinycolor2';

import { FieldType, rangeUtil, type FieldConfig, type GrafanaTheme2 } from '@grafana/data';
import { t } from '@grafana/i18n';
import { GraphDrawStyle, type GraphFieldConfig } from '@grafana/schema';

import { useStyles2 } from '../../themes/ThemeContext';
import { clearButtonStyles } from '../Button/Button';
import { FormattedValueDisplay } from '../FormattedValueDisplay/FormattedValueDisplay';
import { Sparkline } from '../Sparkline/Sparkline';

import { buildLayout } from './BigValueLayout';
import { BigValueJustifyMode, type Props } from './BigValueTypes';
import { PercentChange } from './PercentChange';

/**
 * Component for showing a value based on a [DisplayValue](https://github.com/grafana/grafana/blob/main/packages/grafana-data/src/types/displayValue.ts#L5).
 *
 * https://developers.grafana.com/ui/latest/index.html?path=/docs/plugins-bigvalue--docs
 */
export const BigValue = memo<Props>((props) => {
  const {
    onClick,
    className,
    hasLinks,
    theme,
    justifyMode = BigValueJustifyMode.Auto,
    enableDrilldown,
    sparkline,
    width,
    height,
    value,
  } = props;

  const [drilldownOpen, setDrilldownOpen] = useState(false);
  const styles = useStyles2(getStyles);

  const layout = buildLayout({ ...props, justifyMode });
  const panelStyles = layout.getPanelStyles();
  const valueAndTitleContainerStyles = layout.getValueAndTitleContainerStyles();
  const valueStyles = layout.getValueStyles();
  const titleStyles = layout.getTitleStyles();
  const textValues = layout.textValues;
  const percentChange = props.value.percentChange;
  const percentChangeColorMode = props.percentChangeColorMode;
  const showPercentChange = percentChange != null && !Number.isNaN(percentChange);

  // When there is an outer data link this tooltip will override the outer native tooltip
  const tooltip = hasLinks ? undefined : textValues.tooltip;

  const drilldownEnabled = Boolean(enableDrilldown) && !onClick;

  const valueContent = (
    <div style={valueAndTitleContainerStyles}>
      {textValues.title && <div style={titleStyles}>{textValues.title}</div>}
      <FormattedValueDisplay value={textValues} style={valueStyles} />
      {showPercentChange && (
        <PercentChange
          percentChange={percentChange}
          styles={layout.getPercentChangeStyles(percentChange, percentChangeColorMode, valueStyles)}
        />
      )}
    </div>
  );

  const drilldownChart =
    drilldownEnabled && drilldownOpen ? (
      <DrilldownChart
        sparkline={sparkline}
        width={width}
        height={height}
        valueColor={value.color}
        theme={theme}
        styles={styles}
      />
    ) : null;

  if (onClick) {
    return (
      <button
        type="button"
        className={cx(clearButtonStyles(theme), className)}
        style={panelStyles}
        onClick={onClick}
        title={tooltip}
      >
        <div style={valueAndTitleContainerStyles}>
          {textValues.title && <div style={titleStyles}>{textValues.title}</div>}
          <FormattedValueDisplay value={textValues} style={valueStyles} />
        </div>
        {layout.renderChart()}
      </button>
    );
  }

  if (drilldownEnabled) {
    return (
      <button
        type="button"
        className={cx(clearButtonStyles(theme), className)}
        style={{
          ...panelStyles,
          // Stay within VizRepeater's fixed cell height; reflow content instead of growing.
          ...(drilldownOpen ? { flexDirection: 'column' as const, overflow: 'hidden' } : {}),
        }}
        onClick={() => setDrilldownOpen((open) => !open)}
        title={tooltip}
        aria-expanded={drilldownOpen}
      >
        {valueContent}
        {!drilldownOpen && layout.renderChart()}
        {drilldownChart}
      </button>
    );
  }

  return (
    <div className={className} style={panelStyles} title={tooltip}>
      {valueContent}
      {layout.renderChart()}
    </div>
  );
});

BigValue.displayName = 'BigValue';

interface DrilldownChartProps {
  sparkline: Props['sparkline'];
  width: number;
  height: number;
  valueColor?: string;
  theme: Props['theme'];
  styles: ReturnType<typeof getStyles>;
}

function DrilldownChart({ sparkline, width, height, valueColor, theme, styles }: DrilldownChartProps) {
  const chartHeight = Math.max(48, Math.min(80, Math.round(height * 0.35)));
  const chartWidth = Math.max(0, width - 16);
  const lineColor = valueColor ?? theme.colors.text.primary;
  const fillColor = tinycolor(lineColor).setAlpha(0.2).toRgbString();

  const hasChart = sparkline && sparkline.y?.type === FieldType.number && sparkline.y.values.length > 0;

  const config: FieldConfig<GraphFieldConfig> | undefined = hasChart
    ? {
        custom: {
          drawStyle: GraphDrawStyle.Line,
          lineWidth: 1,
          fillColor,
          lineColor,
        },
      }
    : undefined;

  const title = sparkline?.timeRange
    ? rangeUtil.describeTimeRange(sparkline.timeRange.raw)
    : t('big-value.drilldown-trend', 'Trend');

  return (
    <div className={styles.drilldown}>
      <div className={styles.drilldownTitle}>{title}</div>
      {hasChart && config && (
        <div className={styles.drilldownChart}>
          <Sparkline height={chartHeight} width={chartWidth} sparkline={sparkline} config={config} theme={theme} />
        </div>
      )}
    </div>
  );
}

const getStyles = (theme: GrafanaTheme2) => {
  return {
    drilldown: css({
      width: '100%',
      marginTop: theme.spacing(1),
      paddingTop: theme.spacing(1),
      borderTop: `1px solid ${theme.colors.border.weak}`,
      textAlign: 'left',
      flexShrink: 0,
      minHeight: 0,
      overflow: 'hidden',
    }),
    drilldownTitle: css({
      fontSize: theme.typography.bodySmall.fontSize,
      fontWeight: theme.typography.fontWeightMedium,
      color: theme.colors.text.secondary,
      marginBottom: theme.spacing(0.5),
    }),
    drilldownChart: css({
      width: '100%',
    }),
  };
};
