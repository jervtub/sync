async function ntp ( socket ) {
  return new Promise( ( resolve, reject ) => {
    let t1 = Date.now(), t3, delta, theta;
    socket.emit( "ntp" , ( t2 ) => {
      t3    = Date.now() ;
      delta = t3 - t1; // round-trip latency
      theta = 0.5 * (( t1 - t2 ) + ( t3 - t2 )); // time offset
      //  localtime = servertime + theta
      //      theta = localtime - servertime
      //      theta = 0.5 * (( t1 - t2 ) + ( t3 - t2 ))
      // log ( { message: "Resolved NTP", payload: { t1, t2, t3, theta, delta } } );
      resolve( { delta, theta })
      // resolve( theta );
    } )
  });
}
