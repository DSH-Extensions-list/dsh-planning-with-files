/**
 * DeepSeek Harness (dsh) plugin entry for planning-with-files.
 *
 * A Cordis plugin: `name`, `Config`, `apply(ctx, config)`. The helpers live
 * in ./core.js, a byte-identical copy of the OpenCode core locked by
 * tests/test_dsh_plugin_core_parity.py. Listeners (all fail open: a planning
 * error is logged and the turn proceeds without planning context):
 *
 * - agent/pre-step: append the framed active plan (or the ambiguity notice)
 *   to the step that carries the user's prompt, never to a step that only
 *   carries tool context, steering or this plugin's own injected messages
 * - tools/post-execute: attach the progress reminder to the result of a
 *   write-like tool while a plan exists
 * - session/event with a successful compaction/end: mark the session, so the
 *   next step of that agent (a continuation of the compacted turn, or the next
 *   prompt) carries the compaction note and the plan and resumes at the
 *   current phase. The published dsh (0.1.5-rc.2) declares `compact` as an
 *   agent/session-start source but every dispatch site announces `startup` or
 *   `resume` only, and the 0.1.6 alpha line does the same on agent/created;
 *   the durable compaction/end event is what both lines actually write.
 * - agent/turn-stopping: the completion gate in gated mode, steering the
 *   agent into another step with the gate reason (Tier 2: follow-up inject)
 * - commands /pwf and /pwf-status, tools pwf_init, pwf_status, pwf_check
 *
 * The `commands` and `tools` services are consumed through ctx.inject so the
 * lifecycle listeners load in every profile, including one without them.
 */
import type { Context } from "@deepseek-ai/cordis";
import Schema from "@deepseek-ai/schemastery";
export declare const name = "planning-with-files";
/** Empty on purpose: the lifecycle listeners must never wait on an optional service. */
export declare const inject: readonly [];
export interface Config {
    /** Register nothing when false; the row can stay in the profile. */
    enabled: boolean;
    /** Register the turn-stopping completion gate. */
    gate: boolean;
}
export declare const Config: Schema<Config>;
/**
 * The producer-owned source kind stamped on every message this plugin injects.
 *
 * DSH session format V4 refuses the retired V3 `{kind:'plugin'}` wrapper at
 * encoding time (SessionFormatError: "format v4 message requires a
 * producer-owned source kind"), so every DSH 0.1.7+ turn that carries one of
 * this plugin's injected messages fails to persist. The MessageSourceMap
 * contract is merge-extensible — each producer declares its own `kind` in its
 * own module — and `plugin:<name>` is the exact shape the V3-to-V4 lifter
 * (`producerKind`) produces for released plugin sources.
 */
declare module "@deepseek-ai/dsh-llm" {
    interface MessageSourceMap {
        "plugin:planning-with-files": {
            kind: "plugin:planning-with-files";
        };
    }
}
export declare function apply(ctx: Context, config: Config): void;
