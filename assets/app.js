
import {createClient} from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm'

const supabase=createClient(
'https://zifhrxvhkpduemomgbho.supabase.co',
'sb_publishable_L1xSXdqiPawMaef-EEfzDQ_C5Z9MlU5'
)

document.querySelector('#root').innerHTML=`
<h1>NexaTech Intranet</h1>
<input id="correo" placeholder="correo">
<input id="clave" placeholder="contraseña" type="password">
<button id="btn">Ingresar</button>
<p id="msg"></p>`

btn.onclick=async()=>{
let {data,error}=await supabase
.from('usuarios')
.select('*')
.eq('correo',correo.value)
.eq('contraseña',clave.value)
.single()

msg.innerHTML=error?'Credenciales incorrectas':'Bienvenido '+data.nombre+' - '+data.rol
}
