fetch("http://localhost:5000/api/resources").then(r => r.text()).then(t => console.log(t));
