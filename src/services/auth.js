export const loginService = (email, password) =>
  new Promise((resolve, reject) => {
    setTimeout(() => {
      if (email && password) resolve({ email, name: 'Usuário' })
      else reject(new Error('Credenciais inválidas'))
    }, 800)
  })

export const registerService = (data) =>
  new Promise((resolve) => {
    setTimeout(() => resolve({ ...data, id: Date.now() }), 800)
  })
