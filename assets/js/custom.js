function register() {

    let item = {
        
        modo: $("#mode").val(),
        amount: $("#amount").val(),
        description: $("#description").val(),
        datetime : new Date().toLocaleString(),
        type : $("#type").val()

       };
       console.log(item)

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


// (() => {
//     const forms = document.querySelectorAll('.validar')
//     var register = document.getElementById('register-btn')
  
//     // Loop over them and prevent submission
//     Array.from(forms).forEach(form => {
//       register.addEventListener('click', event => {
//         console.log('ok')
//         if (!form.checkValidity()) {
//           event.preventDefault()
//           event.stopPropagation()
//         }
  
//         form.classList.add('was-validated')
//       }, false)
//     })
//   })()
  