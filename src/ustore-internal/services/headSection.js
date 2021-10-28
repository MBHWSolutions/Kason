const createLink = (file, i) => {
  if (typeof file === 'string') {
    return <link rel="stylesheet" href={`${file}?rand=${Math.random()}`} key={i}/>;
  }
  if (typeof file === 'object') {
    return <link rel="stylesheet" {...file} key={i}/>;
  }
  return null;
};

export const createHeadSection = (styleUrls, baseUrl) => {
  const linkTags = styleUrls ? styleUrls.map((file, i) => createLink(file, i)) : [];
  return [
    <meta name="viewport" content="width=device-width, initial-scale=1" />,
    ...linkTags
  ];

}

