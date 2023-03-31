import { Param, PipeTransform, Type } from '@nestjs/common'

export const GLOBAL_PREFIX = ''

export const ROUTE_NODES = 'nodes'
export const ROUTE_NODE_ID = ':nodeId'
export const ROUTE_CONTAINERS = 'containers'
export const ROUTE_PREFIX = ':prefix'
export const ROUTE_NAME = ':name'

export const NodeId = (...pipes: (Type<PipeTransform> | PipeTransform)[]) => Param('nodeId', ...pipes)
export const Prefix = () => Param('prefix')
export const Name = () => Param('name')
