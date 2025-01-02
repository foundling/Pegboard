function zip(a,b) {

  const length = Math.min(a.length, b.length);
  const pairs = [];

  for (let i = 0; i < length; i++) { 

    const pair = [a[i],b[i]]; 
    pairs.push(pair);

  }

  return pairs;

}

export { zip };
