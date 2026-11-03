import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { tiktokReview } from '../../services/tiktokReview'
import './TikTokReview.css'

const ROOT = '/social/tiktok/review'
const privacyLabels = { SELF_ONLY: 'Somente eu', PUBLIC_TO_EVERYONE: 'Todos', MUTUAL_FOLLOW_FRIENDS: 'Amigos', FOLLOWER_OF_CREATOR: 'Seguidores' }
const fmt = value => value == null ? 'Indisponível' : new Intl.NumberFormat('pt-BR').format(value)

export default function TikTokReview() {
  const [companyId, setCompanyId] = useState(() => sessionStorage.getItem('tiktok-review-company') || '')
  const [profile, setProfile] = useState(null)
  const [videos, setVideos] = useState(null)
  const [creator, setCreator] = useState(null)
  const [mode, setMode] = useState('direct')
  const [file, setFile] = useState(null)
  const [preview, setPreview] = useState('')
  const [duration, setDuration] = useState(null)
  const [title, setTitle] = useState('')
  const [privacy, setPrivacy] = useState('')
  const [interactions, setInteractions] = useState({ comment: false, duet: false, stitch: false })
  const [commercial, setCommercial] = useState(false)
  const [ownBrand, setOwnBrand] = useState(false)
  const [branded, setBranded] = useState(false)
  const [consent, setConsent] = useState(false)
  const [publishId, setPublishId] = useState('')
  const [status, setStatus] = useState(null)
  const [error, setError] = useState(() => new URLSearchParams(window.location.search).get('error') || '')
  const [busy, setBusy] = useState(false)
  const [events, setEvents] = useState([])
  const [uploadMode, setUploadMode] = useState('')
  const request = (path, body) => tiktokReview(path, { companyId: companyId.trim(), body })
  const run = async (label, action) => {
    setBusy(true); setError('')
    try {
      await action()
      setEvents(items => [{ label, at: new Date().toLocaleTimeString('pt-BR') }, ...items])
    } catch (err) { setError(err.message) }
    finally { setBusy(false) }
  }
  useEffect(() => {
    if (!file) { setPreview(''); return }
    const url = URL.createObjectURL(file)
    setPreview(url)
    return () => URL.revokeObjectURL(url)
  }, [file])
  useEffect(() => {
    setProfile(null); setVideos(null); setCreator(null); setPrivacy(''); setPublishId(''); setStatus(null)
    sessionStorage.setItem('tiktok-review-company', companyId)
  }, [companyId])
  useEffect(() => {
    if (mode !== 'direct') return
    let cancelled = false
    setCreator(null); setPrivacy('')
    setInteractions({ comment: false, duet: false, stitch: false })
    tiktokReview(`${ROOT}/creator`, { companyId: companyId.trim() })
      .then(data => { if (!cancelled) setCreator(data.data) })
      .catch(err => { if (!cancelled) setError(err.message) })
    return () => { cancelled = true }
  }, [mode, companyId])
  useEffect(() => {
    if (!publishId) return
    let cancelled = false
    let timer
    let count = 0
    const poll = async () => {
      try {
        const result = await tiktokReview(`${ROOT}/status?publishId=${encodeURIComponent(publishId)}`, { companyId: companyId.trim() })
        if (cancelled) return
        setStatus(result.data)
        if (['PUBLISH_COMPLETE', 'SEND_TO_USER_INBOX', 'FAILED', 'CANCELLED'].includes(result.data.status)) return
        count += 1
        if (count < 75) timer = setTimeout(poll, 4000)
        else setError('O TikTok continua processando. Use Consultar status para acompanhar este envio.')
      } catch (err) { if (!cancelled) setError(err.message) }
    }
    poll()
    return () => { cancelled = true; clearTimeout(timer) }
  }, [publishId, companyId])

  const loadCreator = async () => {
    setCreator(null); setPrivacy(''); setInteractions({ comment: false, duet: false, stitch: false })
    setCreator((await request(`${ROOT}/creator`)).data)
  }
  const send = async () => {
    const form = new FormData()
    Object.entries({ video: file, mode, title, privacy, ...interactions, commercial, ownBrand, branded, consent })
      .forEach(([key, value]) => form.append(key, value))
    setPublishId(''); setStatus(null)
    const result = await request(`${ROOT}/video`, form)
    setPublishId(result.data.publish_id); setUploadMode(mode)
  }
  const directInvalid = mode === 'direct' && (!creator || !privacy || !duration || duration > creator.max_video_post_duration_sec ||
    (commercial && !ownBrand && !branded) || (commercial && branded && privacy === 'SELF_ONLY'))
  const invalidFile = !file || file.type !== 'video/mp4' || file.size > 64_000_000
  return (
    <main className="tt-review">
      <header><Link to="/dashboard">HubStudio</Link><span>Integração TikTok</span><Link to="/dashboard/configuracoes">Configurações</Link></header>
      <div className="tt-review-content">
        <div className="tt-review-intro"><small>CRIADORES · TIKTOK</small><h1>Seu conteúdo, sua comunidade.</h1><p>Conecte seu perfil, acompanhe seus vídeos e escolha como compartilhar.</p></div>
        <details className="tt-review-setup"><summary>Preparação da sessão</summary><p>Faça login no HubStudio antes de começar. Use a conta de teste cadastrada no aplicativo TikTok.</p><label>ID da empresa (opcional para sua empresa padrão)<input value={companyId} onChange={e => setCompanyId(e.target.value)} disabled={busy} /></label><Link to="/entrar">Entrar no HubStudio</Link><p>Esta página usa a API real. Nenhum resultado é simulado.</p></details>
        {error && <div role="alert" className="tt-review-error">{error}</div>}
        <section>
          <div className="tt-review-heading"><div><small>01 · CONEXÃO</small><h2>Seu perfil TikTok</h2></div><button disabled={busy} onClick={() => run('Autorização iniciada', async () => {
            const data = await request('/social/tiktok/connect')
            window.location.assign(data.authorizationUrl)
          })}>Conectar TikTok</button></div>
          <p>Autorize o acesso no TikTok. Depois do retorno, abra esta página para consultar sua conta.</p>
          <button className="secondary" disabled={busy} onClick={() => run('Perfil e estatísticas consultados', async () => setProfile((await request(`${ROOT}/profile`)).data.user))}>Atualizar perfil e estatísticas</button>
          {profile && <div className="tt-review-profile">
            <div>{profile.avatar_url && <img src={profile.avatar_url} alt="Avatar do TikTok" />}<h3>{profile.display_name} {profile.is_verified && '✓'}</h3><p>@{profile.username}</p><p>{profile.bio_description || 'Sem biografia'}</p>{profile.profile_deep_link && <a href={profile.profile_deep_link} target="_blank" rel="noreferrer">Abrir perfil no TikTok ↗</a>}</div>
            <div className="tt-review-stats">{[['Seguidores', profile.follower_count], ['Seguindo', profile.following_count], ['Curtidas', profile.likes_count], ['Vídeos públicos', profile.video_count]].map(([label, value]) => <div key={label}><strong>{fmt(value)}</strong><span>{label}</span></div>)}</div>
          </div>}
          <p className="tt-review-scopes">user.info.basic · user.info.profile · user.info.stats</p>
        </section>
        <section><div className="tt-review-heading"><div><small>02 · BIBLIOTECA</small><h2>Seus vídeos públicos</h2></div><button disabled={busy} onClick={() => run('Vídeos públicos consultados', async () => setVideos((await request(`${ROOT}/videos`)).data))}>Buscar vídeos</button></div>
          {videos && <><div className="tt-review-videos">{(videos.videos || []).map(video => <article key={video.id}><h3>{video.title || 'Vídeo sem título'}</h3><p>{fmt(video.view_count)} visualizações · {fmt(video.like_count)} curtidas</p><p>{fmt(video.comment_count)} comentários · {fmt(video.share_count)} compartilhamentos</p><a href={video.share_url} target="_blank" rel="noreferrer">Assistir no TikTok ↗</a></article>)}</div>{!videos.videos?.length && <p>A conta não possui vídeos públicos disponíveis.</p>}{videos.has_more && <button disabled={busy} onClick={() => run('Mais vídeos consultados', async () => {
            const next = (await request(`${ROOT}/videos?cursor=${videos.cursor}`)).data
            setVideos({ ...next, videos: [...videos.videos, ...(next.videos || [])] })
          })}>Carregar mais</button>}</>}
          <p className="tt-review-scopes">video.list</p>
        </section>
        <section><div className="tt-review-heading"><div><small>03 · COMPARTILHAR</small><h2>Prepare seu vídeo</h2></div></div>
          <label>Como deseja compartilhar?<select value={mode} disabled={busy} onChange={e => { setMode(e.target.value); setConsent(false); setCreator(null); setPrivacy('') }}><option value="direct">Publicar diretamente no perfil</option><option value="inbox">Enviar ao TikTok para editar e publicar</option></select></label>
          {mode === 'inbox' && <p>O vídeo será enviado à caixa de entrada. Abra a notificação no aplicativo TikTok para editar e concluir a publicação.</p>}
          {mode === 'direct' && <><button className="secondary" disabled={busy} onClick={() => run('Opções do criador consultadas', loadCreator)}>Carregar opções da conta</button>{creator && <p>Publicar como <strong>{creator.creator_nickname}</strong> (@{creator.creator_username}) · até {creator.max_video_post_duration_sec}s</p>}</>}
          <label>Vídeo MP4 · até 64 MB<input type="file" accept="video/mp4" disabled={busy} onChange={e => { setFile(e.target.files?.[0] || null); setDuration(null); setConsent(false) }} /></label>
          {preview && <video className="tt-review-preview" src={preview} controls onLoadedMetadata={e => setDuration(e.target.duration)} onError={() => { setDuration(null); setError('Não foi possível ler este vídeo. Escolha outro MP4.') }} />}
          {file && invalidFile && <p role="alert">Use um arquivo MP4 de até 64 MB.</p>}
          {mode === 'direct' && <><label>Legenda<textarea maxLength={2200} value={title} disabled={busy} onChange={e => setTitle(e.target.value)} placeholder="Escreva sua legenda" /></label>
            <label>Quem pode assistir?<select disabled={busy || !creator} value={privacy} onChange={e => setPrivacy(e.target.value)}><option value="">Selecione a privacidade</option>{(creator?.privacy_level_options || []).map(value => <option key={value} value={value} disabled={commercial && branded && value === 'SELF_ONLY'}>{privacyLabels[value] || value}</option>)}</select></label>
            <div className="tt-review-checks">{[['comment', 'Permitir comentários'], ['duet', 'Permitir Dueto'], ['stitch', 'Permitir Costurar']].map(([key, label]) => <label key={key}><input type="checkbox" disabled={busy || !creator || creator[`${key}_disabled`]} checked={interactions[key] && !creator?.[`${key}_disabled`]} onChange={e => setInteractions({ ...interactions, [key]: e.target.checked })} />{label}{creator?.[`${key}_disabled`] && ' (desativado no TikTok)'}</label>)}</div>
            <label className="tt-review-check"><input type="checkbox" checked={commercial} disabled={busy} onChange={e => setCommercial(e.target.checked)} />Este conteúdo promove uma marca, produto ou serviço</label>
            {commercial && <div className="tt-review-checks"><label><input type="checkbox" checked={ownBrand} disabled={busy} onChange={e => setOwnBrand(e.target.checked)} />Sua marca · rótulo “Conteúdo promocional”</label><label><input type="checkbox" checked={branded} disabled={busy || privacy === 'SELF_ONLY'} onChange={e => setBranded(e.target.checked)} />Outra marca · rótulo “Parceria paga” (não permite Somente eu)</label></div>}
            {duration && creator && duration > creator.max_video_post_duration_sec && <p role="alert">O vídeo excede a duração permitida para esta conta.</p>}
          </>}
          <label className="tt-review-check"><input type="checkbox" disabled={busy} checked={consent} onChange={e => setConsent(e.target.checked)} /><span>{mode === 'direct' ? 'Ao publicar, concordo com a ' : 'Autorizo o envio deste vídeo ao TikTok e concordo com a '}<a href="https://www.tiktok.com/legal/page/global/music-usage-confirmation/en" target="_blank" rel="noreferrer">Confirmação de Uso de Música do TikTok</a>{mode === 'direct' && commercial && branded && <> e com a <a href="https://www.tiktok.com/legal/page/global/bc-policy/en" target="_blank" rel="noreferrer">Política de Conteúdo de Marca</a></>}.</span></label>
          <button disabled={busy || invalidFile || !consent || directInvalid} onClick={() => run(mode === 'direct' ? 'Vídeo enviado para publicação direta' : 'Vídeo enviado à caixa de entrada', send)}>{busy ? 'Aguarde…' : mode === 'direct' ? 'Publicar no TikTok' : 'Enviar para editar no TikTok'}</button>
          <p>O processamento pode levar alguns minutos. A confirmação de envio não significa que o vídeo já foi publicado.</p>
          {publishId && <div className="tt-review-result"><p>Envio recebido pelo TikTok · {publishId}</p><button className="secondary" disabled={busy} onClick={() => run('Status do envio consultado', async () => setStatus((await request(`${ROOT}/status?publishId=${encodeURIComponent(publishId)}`)).data))}>Consultar status</button>{status && <><p>Status TikTok: <strong>{status.status}</strong></p>{status.fail_reason && <p role="alert">{status.fail_reason}</p>}{status.status === 'SEND_TO_USER_INBOX' && <p>Abra o TikTok no celular e toque na notificação para continuar a edição.</p>}{status.status === 'PUBLISH_COMPLETE' && <p>{uploadMode === 'direct' ? 'Publicação concluída pelo TikTok.' : 'Fluxo concluído no TikTok.'}</p>}</>}</div>}
          <p className="tt-review-scopes">{mode === 'direct' ? 'video.publish' : 'video.upload'}</p>
        </section>
        {events.length > 0 && <details><summary>Atividade desta sessão</summary>{events.map((event, index) => <p key={index}>{event.at} · {event.label}</p>)}</details>}
        <footer><Link to="/privacy">Política de privacidade</Link><Link to="/terms">Termos de uso</Link></footer>
      </div>
    </main>
  )
}
