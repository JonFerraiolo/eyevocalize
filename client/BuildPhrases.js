
export function BuildPhrases(textFileContents) {
  let lines = textFileContents.split(/\r?\n/g);
  let phrases = lines.map((line, index) => {
    let tags, text, label, weight;
    let matches;
    let setInvalid = () => {
      console.error('Line '+(index+1)+' has invalid format and will be ignored:\n' +line+'\n');
    }
    let trimmed = line.trim();
    if (trimmed.length === 0) {
      return { comment: true };
    }
    let firstChar = trimmed.charAt(0);
    forloop:
    for (let i=0; i<100; i++) {  // for loop instead of while (true) to  prevent infinite loop
      switch (firstChar) {
        case '#':  // comment line
          return { comment: true };
        case '[':  // See if the line has the form [tag tag ...] whatever
          if (Array.isArray(tags)) {  // can't have two of these on the same line
            setInvalid();
            return { invalid: true };
          }
          matches = trimmed.match(/^\[([^\]]*)\](.*)$/);
          if (matches) {
            matches.shift();  // drop first item, which is entire matching string
            // shift off next item, which is space-separated list of tags,
            // consolidate white space, trim off leading, trailing whitespace,
            // then split using blank as separator.
            tags = matches.shift().replace(/\s+/g, ' ').trim().split(' ');
            trimmed = matches.shift().trim();
            firstChar = trimmed.charAt(0);
            break;
          } else {
            setInvalid();
            return { invalid: true };
          }
        case '{':  // See if the line has the form {labelstring} whatever
          if (typeof label === 'string') {  // can't have two of these on the same line
            setInvalid();
            return { invalid: true };
          }
          matches = trimmed.match(/^\{([^\}]*)\}(.*)$/);
          if (matches) {
            matches.shift();  // drop first item, which is entire matching string
            // shift off next item, which is the label,
            // consolidate white space, trim off leading, trailing whitespace
            label = matches.shift().replace(/\s+/g, ' ').trim();
            trimmed = matches.shift().trim();
            firstChar = trimmed.charAt(0);
            break;
          } else {
            setInvalid();
            return { invalid: true };
          }
        case '(':  // See if the line has the form (weight) whatever
          if (typeof weight === 'number') {  // can't have two of these on the same line
            setInvalid();
            return { invalid: true };
          }
          matches = trimmed.match(/^\(([^\)]*)\)(.*)$/);
          if (matches) {
            matches.shift();  // drop first item, which is entire matching string
            // shift off next item, which is the label,
            // consolidate white space, trim off leading, trailing whitespace
            weight = parseFloat(matches.shift().replace(/\s+/g, ' ').trim());
            if (isNaN(weight)) {
              setInvalid();
              return { invalid: true };
            }
            trimmed = matches.shift().trim();
            firstChar = trimmed.charAt(0);
            break;
          } else {
            setInvalid();
            return { invalid: true };
          }
        default:
          text = trimmed;
          return { text, tags, label, weight };
      }
    }
    setInvalid();
    return { invalid: true };
  }).filter(item => {
    return (!item.invalid && !item.comment);
  });
  return phrases;
};
