import { mockDelay } from './http'

export const loginApi = async ({ username, password }) => {
  if (!username || !password) {
    throw new Error('请输入账号和密码')
  }

  return mockDelay({
    token: `mock-token-${Date.now()}`,
    user: {
      id: 'u-10086',
      name: username,
      role: username === 'admin' ? '系统管理员' : '文旅游客'
    }
  })
}

export const registerApi = async (payload) => {
  if (!payload.username || !payload.email || !payload.password) {
    throw new Error('请补全注册信息')
  }

  return mockDelay({
    token: `mock-token-${Date.now()}`,
    user: {
      id: `u-${Date.now()}`,
      name: payload.username,
      role: '文旅游客'
    }
  })
}
