import { describe, it, expect, vi } from 'vitest'
import { InterviewRecorder, saveRecording } from '../lib/recorder'

describe('InterviewRecorder & Local Save System', () => {
  it('instantiates InterviewRecorder cleanly with inactive state', () => {
    const recorder = new InterviewRecorder()
    expect(recorder).toBeDefined()
  })

  it('rejects stopping when there is no active recording', async () => {
    const recorder = new InterviewRecorder()
    await expect(recorder.stop()).rejects.toThrow('There is no active recording to stop.')
  })

  it('saveRecording falls back to anchor download when showSaveFilePicker is absent', async () => {
    const testBlob = new Blob(['sample-video-content'], { type: 'video/webm' })
    const filename = 'InterviewCapture_test.webm'

    // Mock URL.createObjectURL and URL.revokeObjectURL
    const originalCreateObjectUrl = URL.createObjectURL
    const originalRevokeObjectUrl = URL.revokeObjectURL
    URL.createObjectURL = vi.fn().mockReturnValue('blob:http://localhost/mock-uuid')
    URL.revokeObjectURL = vi.fn()

    // Mock document.body.appendChild and HTMLAnchorElement click
    const clickSpy = vi.fn()
    const originalCreateElement = document.createElement.bind(document)
    vi.spyOn(document, 'createElement').mockImplementation((tagName: string) => {
      const el = originalCreateElement(tagName)
      if (tagName === 'a') {
        el.click = clickSpy
      }
      return el
    })

    const outcome = await saveRecording(testBlob, filename)
    expect(outcome).toBe('downloaded')
    expect(clickSpy).toHaveBeenCalled()

    // Restore
    URL.createObjectURL = originalCreateObjectUrl
    URL.revokeObjectURL = originalRevokeObjectUrl
    vi.restoreAllMocks()
  })

  it('saveRecording handles user cancellation in showSaveFilePicker', async () => {
    const testBlob = new Blob(['sample-video-content'], { type: 'video/webm' })
    const filename = 'InterviewCapture_test.webm'

    const originalPicker = (window as unknown as { showSaveFilePicker?: unknown }).showSaveFilePicker
    ;(window as unknown as { showSaveFilePicker: unknown }).showSaveFilePicker = vi.fn().mockRejectedValue(
      new DOMException('The user aborted a request.', 'AbortError')
    )

    const outcome = await saveRecording(testBlob, filename)
    expect(outcome).toBe('cancelled')

    // Restore
    ;(window as unknown as { showSaveFilePicker: unknown }).showSaveFilePicker = originalPicker
  })
})
