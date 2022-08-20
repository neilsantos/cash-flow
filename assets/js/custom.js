
const cash = []

function register() {


  let movimento = {

    modo: $("#mode").val(),
    amount: $("#amount").val(),
    description: $("#description").val(),
    datetime: new Date().toLocaleString(),
    time: new Date().toLocaleTimeString(),
    type: $("#type").val()

  };

  if (movimento.modo && movimento.amount && movimento.description && movimento.type != 'null') {
    cash.push(movimento)

    var tbody = document.getElementById('table-body')
    var tr = document.createElement('tr')
    var th = document.createElement('th')
    var td1 = document.createElement('td')
    var td2 = document.createElement('td')
    var td3 = document.createElement('td')
    var td4 = document.createElement('td')
    var td5 = document.createElement('td')

    th.innerHTML = 1

    var span = document.createElement('span')

    if(movimento.type == 'dinheiro'){
      span.setAttribute('class', 'badge bg-success')
      span.innerHTML = 'Dinheiro'
    }else if(movimento.type =="credito"){
      span.setAttribute('class', 'badge bg-danger')
      span.innerHTML = 'Crédito'
    }else if(movimento.type){
      span.setAttribute('class', 'badge bg-primary')
      span.innerHTML = 'Pix'
    }
    
    td1.appendChild(span)
    td2.innerHTML = movimento.time
    td3.innerHTML = movimento.description

    var td4i = document.createElement('i')
    if (movimento.modo == 'in') {
      td4i.setAttribute('class', 'in bi bi-arrow-down-square-fill ')
    } else {
      td4i.setAttribute('class', 'out bi bi-arrow-up-square-fill ')
    }
    td4i.setAttribute('style','font-style: normal;')
    td4i.innerHTML ='  '+ movimento.amount
    td4.appendChild(td4i)

    var td5i = document.createElement('a')
    td5i.setAttribute('class', 'bi bi-trash-fill')
    td5.appendChild(td5i)

    tr.append(th)
    tr.append(td1)
    tr.append(td2)
    tr.append(td3)
    tr.append(td4)
    tr.append(td5)
    tbody.append(tr)
    //  $("#tableDiv").load(window.location.href + " #tableDiv" );
  } else {
    alert('Você precisa preencher os dados')
  }
  $("#mode").val('');
  $("#amount").val('');
  $("#description").val('');
  $("#type").val('');

}


function formatarMoeda() {
  var elemento = document.getElementById('amount');
  var valor = elemento.value;
  console.log(valor)

  valor = valor + '';
  valor = parseInt(valor.replace(/[\D]+/g, ''));
  valor = valor + '';
  valor = valor.replace(/([0-9]{2})$/g, ",$1");

  if (valor.length > 6) {
    valor = valor.replace(/([0-9]{3}),([0-9]{2}$)/g, ".$1,$2");
  }

  elemento.value = valor;
  if (valor == 'NaN') elemento.value = '';
}


(() => {

  const forms = document.querySelectorAll('.validar')
  var register = document.getElementById('register-btn')

  // Loop over them and prevent submission
  Array.from(forms).forEach(form => {
    register.addEventListener('click', event => {
      console.log('ok')
      if (!form.checkValidity()) {
        event.preventDefault()
        event.stopPropagation()
      }

      form.classList.add('was-validated')
    }, false)
  })
})()
