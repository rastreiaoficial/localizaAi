const $ = s => document.querySelector(s);
const cfg = window.LOCALIZAAI_CONFIG || {};
const db = (cfg.supabaseUrl && cfg.supabaseAnonKey && window.supabase)
  ? window.supabase.createClient(cfg.supabaseUrl, cfg.supabaseAnonKey) : null;
let allSchedules = [];
const dayNames = ['domingo','segunda-feira','terça-feira','quarta-feira','quinta-feira','sexta-feira','sábado'];
const escapeHTML = v => String(v ?? '').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function uniqueSorted(values){return [...new Set(values.filter(Boolean))].sort((a,b)=>a.localeCompare(b,'pt-BR'));}
function fillSelect(select,values,label){const prev=select.value;select.innerHTML=`<option value="">${label}</option>`;uniqueSorted(values).forEach(v=>{const o=document.createElement('option');o.value=v;o.textContent=v;select.append(o)});if(values.includes(prev))select.value=prev;}
function daysText(days){if(!Array.isArray(days)||!days.length)return 'Dias não informados';if(days.length===5&&[1,2,3,4,5].every(x=>days.includes(x)))return 'Segunda a sexta';if(days.length===7)return 'Todos os dias';return days.slice().sort().map(d=>dayNames[d]).join(', ');}
async function loadSchedules(){
  const root=$('#scheduleList');
  if(!db){$('#resultSummary').textContent='Configuração pendente';root.innerHTML='<div class="empty-state">O serviço de horários ainda não está configurado. Tente novamente mais tarde.</div>';$('#updatedAt').textContent='';return;}
  const {data,error}=await db.from('departures').select('id,departure_time,transport_type,operator_name,days_of_week,notes,updated_at,transport_lines!inner(id,origin,destination,is_active,updated_at)').eq('is_active',true).eq('transport_lines.is_active',true).order('departure_time');
  if(error){$('#resultSummary').textContent='Não foi possível carregar os horários';root.innerHTML='<div class="empty-state">Estamos com uma dificuldade temporária para consultar os horários. Tente novamente em instantes.</div>';$('#updatedAt').textContent='';return;}
  allSchedules=(data||[]).map(r=>({...r,origin:r.transport_lines.origin,destination:r.transport_lines.destination,days:daysText(r.days_of_week)}));
  fillSelect($('#originFilter'),allSchedules.map(x=>x.origin),'Todas as origens');fillSelect($('#destinationFilter'),allSchedules.map(x=>x.destination),'Todos os destinos');
  const latest=allSchedules.map(x=>x.updated_at).filter(Boolean).sort().at(-1);
  $('#updatedAt').textContent=latest?'Última atualização registrada: '+new Date(latest).toLocaleString('pt-BR',{dateStyle:'short',timeStyle:'short'}):'Os horários são atualizados pelos administradores quando há mudanças.';
  render();
}
function render(){const origin=$('#originFilter').value,dest=$('#destinationFilter').value,type=$('#typeFilter').value;const rows=allSchedules.filter(x=>(!origin||x.origin===origin)&&(!dest||x.destination===dest)&&(!type||String(x.transport_type).toLowerCase()===(type==='bus'?'ônibus':'van'))).sort((a,b)=>String(a.departure_time).localeCompare(String(b.departure_time)));$('#resultSummary').textContent=`${rows.length} ${rows.length===1?'horário encontrado':'horários encontrados'}`;const root=$('#scheduleList');root.innerHTML='';if(!rows.length){root.innerHTML='<div class="empty-state">Ainda não há horários cadastrados para esta consulta. Se souber de algum, ajude-nos a manter as informações atualizadas.</div>';return;}for(const r of rows){const card=document.createElement('article');card.className='schedule-card';const isBus=String(r.transport_type).toLowerCase()==='ônibus';const type=isBus?'Ônibus':'Van';card.innerHTML=`<div class="time">${escapeHTML(String(r.departure_time).slice(0,5))}</div><div><div class="route-title">${escapeHTML(r.operator_name||type)}</div><div class="route-meta">${escapeHTML(r.origin)} → ${escapeHTML(r.destination)}</div><div class="route-meta">${escapeHTML(r.days)}</div>${r.notes?`<div class="route-meta">${escapeHTML(r.notes)}</div>`:''}</div><span class="transport ${isBus?'bus':''}">${type}</span>`;root.append(card);}}
['#originFilter','#destinationFilter','#typeFilter'].forEach(s=>$(s).addEventListener('change',render));$('#clearFilters').addEventListener('click',()=>{$('#originFilter').value='';$('#destinationFilter').value='';$('#typeFilter').value='';render();});
$('#themeToggle').addEventListener('click',()=>{document.body.classList.toggle('dark');localStorage.setItem('localizaai-theme',document.body.classList.contains('dark')?'dark':'light')});if(localStorage.getItem('localizaai-theme')==='dark')document.body.classList.add('dark');
loadSchedules();if('serviceWorker' in navigator)window.addEventListener('load',()=>navigator.serviceWorker.register('./service-worker.js').catch(()=>{}));
