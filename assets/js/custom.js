$(function () {
  $("#table-body").on("click", ".garbage", function(){
    console.log('Clicked')
  });
});

const cash = []
let money_amount = 0;
let credit_amount = 0;
let transfer_amount = 0;
let amount_in = 0;
let amount_out = 0;
let totalInCash = 0;


function register() {


  let movimento = {

    mode: $("#mode").val(),
    amount: $("#amount").val(),
    description: $("#description").val(),
    datetime: new Date().toLocaleString(),
    time: new Date().toLocaleTimeString(),
    type: $("#type").val()

  };

  if (movimento.mode && movimento.amount && movimento.description && movimento.type != 'null') {

    cash.push(movimento)
    drawTableLine(movimento);

    // counting operations
    if (movimento.type == 'dinheiro') {
      money_amount += parseInt(1)
      var htmlTotalOfMoney = document.getElementById('totalOfMoney')
      htmlTotalOfMoney.innerHTML = money_amount
    } else if (movimento.type == 'pix') {

      transfer_amount += parseInt(1)
      var htmlTotalOfTransfer = document.getElementById('totalOfTransfer')
      htmlTotalOfTransfer.innerHTML = transfer_amount

    } else if (movimento.type == 'credito') {
      credit_amount += parseInt(1)

      var htmlTotalOfCredit = document.getElementById('totalOfCredit')
      htmlTotalOfCredit.innerHTML = credit_amount
    }

    // Modes
    if (movimento.mode == 'in') { //in

      amount_in += parseFloat(movimento.amount)
      var htmlAmountIn = document.getElementById('amount_in')
      htmlAmountIn.innerHTML = amount_in

      if (movimento.type == 'dinheiro') {
        totalInCash += parseFloat(movimento.amount)

        var htmlTotalInCash = document.getElementById('totalInCash')
        htmlTotalInCash.innerHTML = totalInCash
      }

    } else if (movimento.mode == 'out') { //out

      amount_out += parseFloat(movimento.amount)
      var htmlAmountIn = document.getElementById('amount_out')
      htmlAmountIn.innerHTML = amount_out

      if (movimento.type == 'dinheiro') {
        totalInCash -= parseFloat(movimento.amount)

        var htmlTotalInCash = document.getElementById('totalInCash')
        htmlTotalInCash.innerHTML = totalInCash
      }

    }


    if (amount_in && amount_out != 0) {
      var htmlTotal = document.getElementById('total')
      htmlTotal.innerHTML = parseFloat(amount_in - amount_out)
    }


  } else {

    var alert = document.createElement("div")
    alert.setAttribute("class", "alert alert-warning")
    alert.setAttribute("role", "alert")
    alert.setAttribute('id', 'alert')
    alert.innerHTML = "Todos os Campos precisam estar preenchidos"
    var doc = document.getElementById('movimento');
    doc.appendChild(alert);

    setTimeout(function () {
      var rm_alert = document.getElementById('alert')
      rm_alert.remove()

    }, 2000);
  }
  $("#mode").val('');
  $("#amount").val('');
  $("#description").val('');
  $("#type").val('');

}

function drawTableLine(movimento) {

  console.log(movimento)
  var tbody = document.getElementById('table-body')

  var tr = document.createElement('tr')
  var th = document.createElement('th')
  var type_td = document.createElement('td')
  var time_td = document.createElement('td')
  var desc_td = document.createElement('td')
  var amount_td = document.createElement('td')
  var garbage_td = document.createElement('td')

  th.innerHTML = 1

  var type_span = document.createElement('span')

  if (movimento.type == 'dinheiro') {
    type_span.setAttribute('class', 'badge bg-success')
    type_span.innerHTML = 'Dinheiro'
  } else if (movimento.type == "credito") {
    type_span.setAttribute('class', 'badge bg-danger')
    type_span.innerHTML = 'Crédito'
  } else if (movimento.type) {
    type_span.setAttribute('class', 'badge bg-primary')
    type_span.innerHTML = 'Pix'
  }

  var amount_i = document.createElement('i')
  if (movimento.mode == 'in') {
    amount_i.setAttribute('class', 'in bi bi-arrow-down-square-fill ')
  } else {
    amount_i.setAttribute('class', 'out bi bi-arrow-up-square-fill ')
  }
  amount_i.setAttribute('style', 'font-style: normal;')

  var garbage_a = document.createElement('a')
  garbage_a.setAttribute('class', 'bi bi-trash-fill garbage')

  // garbage_a.setAttribute('class', '')

  type_td.appendChild(type_span)
  amount_td.appendChild(amount_i)
  garbage_td.appendChild(garbage_a)

  amount_i.innerHTML = ' R$  ' + movimento.amount
  time_td.innerHTML = movimento.time
  desc_td.innerHTML = movimento.description

  tr.append(th)
  tr.append(type_td)
  tr.append(time_td)
  tr.append(desc_td)
  tr.append(amount_td)
  tr.append(garbage_td)

  tbody.append(tr)
}

function formatarMoeda() {
  var elemento = document.getElementById('amount');
  var valor = elemento.value;

  valor = valor + '';
  valor = parseInt(valor.replace(/[\D]+/g, ''));
  valor = valor + '';

  if (valor.length < 3) {
    valor = valor.replace(/([0-9]{2})$/g, "0.$1");
  } else {
    valor = valor.replace(/([0-9]{2})$/g, ".$1");
  }
  if (valor.length > 6) {
    valor = valor.replace(/([0-9]{3}),([0-9]{2}$)/g, ",$1.$2");
  }

  elemento.value = valor;
  if (valor == 'NaN') elemento.value = '';
}
