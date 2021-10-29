import React from 'react';

import LineChart from '../src/LineChart';

export default {
  title: 'Line Chart',
  component: LineChart,
  argTypes: {
  },
};

const Template = (args) => (
  <LineChart
    data={[
      { value: 5 },
      { value: 10 },
      { value: 10 },
      { value: 10 },
      { value: 10 },
      { value: 10 },
      { value: 10 },
    ]}
    {...args}
  />
);

export const Primary = Template.bind({});

Primary.args = {
  data: [{ value: 5 }, { value: 10 }],
};
