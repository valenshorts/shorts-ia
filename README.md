# Shorts IA: un video por día, gratis y solo

Todos los días a las 11:07 (hora de Argentina), GitHub:

1. Toma la próxima idea de `ideas.json` (hay 30, o sea un mes).
2. Genera 3 escenas en 3D y las anima con IA gratis de Hugging Face.
3. Le pone voz en español rioplatense y subtítulos.
4. Lo sube a tu canal de YouTube, o te lo deja para descargar.

---

## Paso 1: subir esto a GitHub (5 min)

1. Creá una cuenta en **github.com**.
2. Arriba a la derecha tocá **+ → New repository**.
   - Nombre: `shorts-ia`
   - Marcá **Private**.
   - Tocá **Create repository**.
3. En la página nueva tocá **"uploading an existing file"**.
4. Descomprimí el zip y **arrastrá todo lo que hay adentro de la carpeta `shorts-ia`**, incluida la carpeta `.github`. Después tocá **Commit changes**.

## Paso 2: el token de Hugging Face (2 min)

1. Entrá a **huggingface.co/settings/tokens** → **Create new token** → tipo **Read** → copialo.
2. En tu repositorio de GitHub andá a **Settings → Secrets and variables → Actions → New repository secret**.
   - Name: `HF_TOKEN`
   - Secret: pegá el token.
   - Tocá **Add secret**.

> El token no se lo pases a nadie, ni lo pegues en un chat. Solo va en ese lugar.

## Paso 3: probarlo

1. En el repositorio tocá **Actions**. Si te pregunta, tocá **"I understand… enable them"**.
2. A la izquierda elegí **Short diario** → **Run workflow** → **Run workflow**.
3. Tarda entre 5 y 15 minutos. Cuando aparece el tilde verde, entrá a la corrida y abajo de todo, en **Artifacts**, descargá **short**. Ese es tu video.

Si se pone en rojo, casi siempre es porque se terminó la cuota gratis del día de Hugging Face. Al día siguiente sigue solo con la misma idea.

## Paso 4: que se suba solo a YouTube (15 min, cuando quieras)

1. Entrá a **console.cloud.google.com** → creá un proyecto `shorts-ia`.
2. **APIs y servicios → Biblioteca** → buscá **YouTube Data API v3** → **Habilitar**.
3. **Pantalla de consentimiento OAuth** → **Externo** → completá nombre y tu mail → en "Usuarios de prueba" agregá tu Gmail.
   - Después tocá **Publicar app** (pasarla a "En producción"). Si no lo hacés, la conexión se corta a los 7 días.
4. **Credenciales → Crear credenciales → ID de cliente de OAuth**
   - Tipo: **Aplicación web**
   - En "URI de redireccionamiento autorizados" poné: `https://developers.google.com/oauthplayground`
   - Copiá el **ID de cliente** y el **Secreto**.
5. Entrá a **developers.google.com/oauthplayground**:
   - Tocá el engranaje ⚙️ (arriba a la derecha) → tildá **Use your own OAuth credentials** → pegá el ID y el secreto.
   - A la izquierda, en el cuadro de abajo, escribí `https://www.googleapis.com/auth/youtube.upload` → **Authorize APIs**.
   - Entrá con la cuenta del canal. Si dice "Google no verificó esta app", tocá **Configuración avanzada → Ir a…** (es tu propia app).
   - Tocá **Exchange authorization code for tokens** y copiá el **Refresh token**.
6. En GitHub, igual que en el paso 2, creá 3 secretos más:
   - `YT_CLIENT_ID`
   - `YT_CLIENT_SECRET`
   - `YT_REFRESH_TOKEN`

⚠️ **Importante:** mientras Google no apruebe tu proyecto, YouTube deja los videos subidos así en **privado**. Los pasás a público con un toque desde YouTube Studio en el celular. Para que se publiquen solos, pedí la auditoría gratis en el formulario "YouTube API Services – Audit and Quota Extension".

## Cambiar cosas

- **Voz, letra o estilo:** en `config.json`. Por ejemplo, la voz puede ser `es-AR-ElenaNeural` (mujer).
- **Más ideas:** pedile a Claude que te escriba más en el mismo formato y pegalas al final de `ideas.json`.
- **Horario:** en `.github/workflows/diario.yml`, la línea `cron` (la hora va en UTC, que es Argentina + 3).
