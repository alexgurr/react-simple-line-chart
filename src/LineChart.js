import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import Vivus from 'vivus';
import useResizeObserver from '@react-hook/resize-observer';
import useMouse from '@react-hook/mouse-position';
import tinycolor from 'tinycolor2';
import { format } from 'date-fns';
import cx from 'classnames';
import './line-chart.css';

const useSize = (target) => {
  const [size, setSize] = React.useState();

  React.useLayoutEffect(() => {
    setSize(target.current.getBoundingClientRect());
  }, [target]);

  // Where the magic happens
  useResizeObserver(target, (entry) => setSize(entry.contentRect));
  return size;
}; f;

function LineChart({
  data,
  height,
  width,
  color,
  primaryColor,
  showTooltips,
}) {
  const isMultiDataset = Array.isArray(data[0]);

  if (showTooltips && isMultiDataset) {
    console.warn('Tooltips are unsupported on datasets with multiple lines. Skipping.');
  }

  const max = Math.max(...data.map((e) => e.value));
  const min = Math.min(...data.map((e) => e.value));
  const ref = React.useRef(null);
  const mouse = useMouse(ref);
  const [animated, setAnimated] = React.useState(false);
  const [animating, setAnimating] = React.useState(false);
  const [nearestPoint, setPoint] = React.useState(null);
  const [graphKey, setGraphKey] = React.useState(Date.now());
  // const size = useSize(ref);

  // useEffect(() => {
  //   if (isNaN(size.width) || isNaN(size.height)) { return; }
  //   console.log('boo', size)
  //   setAnimated(true);
  //   setAnimating(false);
  // }, [size.width, size.height]);

  const points = data
    .map((element, index) => {
      const x = (index / data.length) * width;
      const y = height - ((element.value - min) / (max - min) * height);

      return { x, y: y >= height - 1 ? height - 1 : y };
    });

  useEffect(() => {
    setAnimated(false);
    setGraphKey(Date.now());
  }, [data]);

  useEffect(() => {
    const { x, elementWidth } = mouse;

    if (x === null) { return void setPoint(null); }

    const relationalX = (x / elementWidth) * width;
    const nearestPointIndex = points.findIndex(
      (point) => Math.abs(relationalX - point.x) <= width * 0.01,
    );

    if (nearestPointIndex < 0) { return; }

    setPoint(nearestPointIndex);
  }, [mouse]);

  const midColor = tinycolor(color).setAlpha(0.5).toRgbString();

  return (
    <div className="rslc" ref={ref}>
      {
        nearestPoint !== null && animated ? <div className="rslc__backdrop" style={{ width: `${(points[nearestPoint].x / width) * 100}%`, borderColor: color }} /> : null
      }
      {
        nearestPoint !== null && animated
          ? (
            <span
              style={{ left: `${(points[nearestPoint].x / width) * 100}%`, background: midColor, color: primaryColor }}
              className="rslc__date"
            >
              {/* {format(data[nearestPoint].date, 'h:mm a - MMM d')} */}
              Foo
              <span className="rslc__date__arrow" style={{ borderTopColor: midColor }} />
            </span>
          ) : null
}
      <svg
        key={graphKey}
        id="rslc-svg"
        className={cx('rslc__svg', { 'rslc--static': !animating })}
        preserveAspectRatio="xMaxYMin meet"
        viewBox={`0 0 ${width} ${height}`}
        ref={(el) => {
          if (!el || animated || animating || !data.length) { return; }

          setAnimating(true);

          new Vivus('rslc-svg', { duration: 200 }, () => {
            setAnimating(false);
            setAnimated(true);
          });
        }}
      >
        <polyline
          fill="none"
          stroke={color}
          strokeWidth={2}
          points={points.map(({ x, y }) => `${x},${y}`).join(' ')}
          vectorEffect="non-scaling-stroke"
        />
        {nearestPoint !== null && animated ? <circle id="rslc-point" cx={points[nearestPoint].x} cy={points[nearestPoint].y} r="1" stroke="none" fill="black" /> : null}
      </svg>
    </div>

  );
}

LineChart.defaultProps = {
  height: 200,
  width: 500,
  animateLines: true,
  tooltipPointColor: 'black',
  tooltipPointSize: 1,
  showTooltips: true,
  lineConfig: {
    color: 'black',
    width: 2,
  },
  color: 'black',
  primaryColor: 'black',
};

const DATA_POINT_TYPE = PropTypes.shape({
  value: PropTypes.number.isRequired,
  label: PropTypes.string,
});

const LINE_CONFIG_TYPE = PropTypes.shape({
  color: PropTypes.string,
  width: PropTypes.number,
});

LineChart.propTypes = {
  data: PropTypes.oneOf([
    PropTypes.arrayOf(DATA_POINT_TYPE),
    PropTypes.arrayOf(PropTypes.arrayOf(DATA_POINT_TYPE)),
  ]).isRequired,
  height: PropTypes.number,
  width: PropTypes.number,
  tooltipPointColor: PropTypes.string,
  tooltipPointSize: PropTypes.number,
  animateLines: PropTypes.bool,
  showTooltips: PropTypes.bool,
  lineConfig: PropTypes.oneOf([
    PropTypes.arrayOf(LINE_CONFIG_TYPE),
    LINE_CONFIG_TYPE,
  ]),
};

export default LineChart;
