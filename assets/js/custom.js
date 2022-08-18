function register() {

    mode = document.getElementById("mode").value;
    description = document.getElementById("description").value;
    amount = document.getElementById("amount").value;

    if (mode || amount || description != "") {
        console.log('Muito bem!')
    } else {
        console.log("Você precisa preencher os campos")
        Toasty();



    }
    console.log(mode)
    console.log(description)
    console.log(amount)
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
    if(valor == 'NaN') elemento.value = '';
}