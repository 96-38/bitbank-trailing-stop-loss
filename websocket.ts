const socket = new WebSocket('ws://javascript.info');

socket.onopen = (e) => {
  console.log('open');
};
