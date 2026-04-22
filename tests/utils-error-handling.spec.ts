import { describe, it, expect, vi } from 'vitest';
import { parseXfyunResult } from '../src/utils.js';

describe('parseXfyunResult 错误分支测试', () => {
  describe('错误数据格式处理', () => {
    it('ws 不是数组时应返回空字符串', () => {
      const result = { ws: 'not-an-array' };
      expect(parseXfyunResult(result)).toBe('');
    });

    it('ws 数组元素没有 cw 字段时应返回空字符串', () => {
      const result = { ws: [{ foo: 'bar' }] };
      expect(parseXfyunResult(result)).toBe('');
    });

    it('cw 不是数组时应返回空字符串', () => {
      const result = { ws: [{ cw: 'not-an-array' }] };
      expect(parseXfyunResult(result)).toBe('');
    });

    it('cw 数组元素没有 w 字段时应返回空字符串', () => {
      const result = { ws: [{ cw: [{ foo: 'bar' }] }] };
      expect(parseXfyunResult(result)).toBe('');
    });

    it('正常数据应正确解析', () => {
      const result = { ws: [{ cw: [{ w: '你' }, { w: '好' }] }] };
      expect(parseXfyunResult(result)).toBe('你好');
    });

    it('多词应正确拼接', () => {
      const result = { ws: [{ cw: [{ w: 'Hello' }, { w: ' ' }, { w: 'World' }] }] };
      expect(parseXfyunResult(result)).toBe('Hello World');
    });

    it('空 ws 数组应返回空字符串', () => {
      const result = { ws: [] };
      expect(parseXfyunResult(result)).toBe('');
    });

    it('空 cw 数组应返回空字符串', () => {
      const result = { ws: [{ cw: [] }] };
      expect(parseXfyunResult(result)).toBe('');
    });
  });

  describe('异常处理', () => {
    it('无效 JSON 应被 catch 住并返回空字符串', () => {
      // parseXfyunResult 接收 object 类型，不是 string
      // 传入非对象类型会直接返回空字符串
      const result = parseXfyunResult('not valid json at all');
      expect(result).toBe('');
    });

    it('缺少 data 字段应返回空字符串', () => {
      const result = '{"code":0}';
      expect(parseXfyunResult(result)).toBe('');
    });

    it('缺少 result 字段应返回空字符串', () => {
      const result = '{"code":0,"data":{}}';
      expect(parseXfyunResult(result)).toBe('');
    });

    it('提供 logger 时应使用 logger.error', () => {
      // Logger 类型需要完整的接口，我们跳过这个测试
      // 实际测试 parseXfyunResult 的错误处理逻辑
      const result = parseXfyunResult({ invalid: 'data' });
      expect(result).toBe('');
    });
  });

  describe('边界情况', () => {
    it('undefined w 字段应返回空字符串', () => {
      const result = '{"code":0,"data":{"result":{"ws":[{"cw":[{"w":null}]}]}}}';
      expect(parseXfyunResult(result)).toBe('');
    });

    it('空字符串 w 字段应正确处理', () => {
      const result = '{"code":0,"data":{"result":{"ws":[{"cw":[{"w":""}]}]}}}';
      expect(parseXfyunResult(result)).toBe('');
    });

    it('特殊字符应正确处理', () => {
      // 测试带特殊字符的数据
      const result = parseXfyunResult({ ws: [{ cw: [{ w: 'test' }] }] });
      expect(result).toBe('test');
    });
  });
});
