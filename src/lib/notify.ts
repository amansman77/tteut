async function sendDiscordMessage(webhookUrl: string, content: string): Promise<void> {
  await fetch(webhookUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ content }),
  });
}

export async function notifyMissingWord(webhookUrl: string, word: string): Promise<void> {
  try {
    await sendDiscordMessage(
      webhookUrl,
      `**살아낸 뜻 없음**: \`${word}\`\n> 누군가 이 단어를 검색했지만 등록된 뜻이 없습니다.`
    );
  } catch {
    // 알림 실패가 응답에 영향을 주지 않음
  }
}

export async function notifyNewMeaning(webhookUrl: string, word: string, meaning: string): Promise<void> {
  try {
    await sendDiscordMessage(
      webhookUrl,
      `**새로운 뜻이 남겨졌습니다** ✍️\n**단어**: ${word}\n**뜻**: ${meaning}`
    );
  } catch {
    // 알림 실패가 응답에 영향을 주지 않음
  }
}
