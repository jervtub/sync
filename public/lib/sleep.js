async function sleep ( ms ) {
  return new Promise( ( resolve, reject ) => {
    setTimeout( resolve, ms );
  });
}

function onFullSecond(x=1) {
  return (x*1000) - (Date.now() % (x*1000));
}

async function everySecond(cb) {
  cb();
  setTimeout( () => everySecond(cb), onFullSecond() );
}

async function everyXSeconds(cb, x, first = true) {
  if (!first) cb()
  setTimeout( () => everyXSeconds(cb, x, false), onFullSecond(x) );
}

function onMilliSecond(x=500) {
  return (x) - (Date.now() % (x));
}
function everyXMilliSeconds(cb, x, first = true) {
  let is_running = true;
  (async () => {
    while (is_running) {
      await sleep(onMilliSecond(x))
      if (!first) cb()
      first = false
    }
  })()
  return (() => { is_running = false })
}
