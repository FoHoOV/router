import { describe, expect, it } from 'vitest'
import { act, render } from '@testing-library/react'

import {
  RouterProvider,
  createRootRoute,
  createRoute,
  createRouter,
} from '../src'

describe('useSearch behavior when validateSearch has transformations', () => {
  const createTestRouter = () => {
    const rootRoute = createRootRoute()
    const indexRoute = createRoute({
      getParentRoute: () => rootRoute,
      path: '/',
      validateSearch: (sp) => {
        if (sp.transformedString) {
          sp.transformedString += 'added'
        }
        return sp
      },
    })
    const routeTree = rootRoute.addChildren([indexRoute])
    return createRouter({ routeTree })
  }

  it('useSearch should apply it once', async () => {
    const router = createTestRouter()

    window.history.replaceState(null, '', `/?transformedString=base`)

    render(<RouterProvider router={router} />)
    await act(() => router.load())

    expect(router.state.location.search.transformedString).toStrictEqual(
      'baseadded',
    )
  })

  it.each(['base', undefined])(
    'useSearch and window.location.search should be in sync when initial is %s',
    async (query) => {
      const router = createTestRouter()

      window.history.replaceState(null, '', '/')

      render(<RouterProvider router={router} />)
      await act(() => router.load())
      await router.navigate({ to: '/', search: { transformedString: query } })
      await router.invalidate()

      expect(
        new URLSearchParams(location.search).get('transformedString'),
      ).toStrictEqual(router.state.location.search.transformedString ?? null)
    },
  )
})
