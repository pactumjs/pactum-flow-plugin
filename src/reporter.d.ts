interface Spec {
  flow: string;
  request: object;
  response: object;
}

interface Interaction {
  provider: string;
  flow: string;
  strict: boolean;
  request: object;
  response: object;
}

export function afterSpec(spec: Spec): void;
export function afterInteraction(interaction: Interaction): void;
export function end(): void;
