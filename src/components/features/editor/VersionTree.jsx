import React, { useState, useEffect } from 'react'
import Tree from 'react-d3-tree'

const VersionTree = ({ 
    writings = [], 
    onNodeClick,
    currentVersion = null 
}) => {
    const [treeData, setTreeData] = useState(null)
    const [translate, setTranslate] = useState({ x: 0, y: 0 })

    // WritingDto 배열을 트리 구조로 변환
    useEffect(() => {
        if (writings.length === 0) return

        // 트리 구조 생성
        const buildTree = () => {
            const nodeMap = new Map()
            
            // 모든 노드를 맵에 저장
            writings.forEach(writing => {
                const key = `${writing.depth}-${writing.siblingIndex}`
                nodeMap.set(key, {
                    name: `v${writing.depth + 1}.${writing.siblingIndex + 1}`,
                    attributes: {
                        author: writing.username,
                        time: new Date(writing.time).toLocaleString(),
                        color: writing.color || '#000',
                        contentId: writing.contentId,
                        depth: writing.depth,
                        siblingIndex: writing.siblingIndex
                    },
                    children: [],
                    data: writing
                })
            })

            // 부모-자식 관계 설정
            writings.forEach(writing => {
                if (writing.depth > 0) {
                    const parentKey = `${writing.depth - 1}-${writing.parentSiblingIndex}`
                    const childKey = `${writing.depth}-${writing.siblingIndex}`
                    
                    const parent = nodeMap.get(parentKey)
                    const child = nodeMap.get(childKey)
                    
                    if (parent && child) {
                        parent.children.push(child)
                    }
                }
            })

            // 루트 노드 찾기 (depth = 0)
            const rootNodes = writings
                .filter(w => w.depth === 0)
                .map(w => nodeMap.get(`${w.depth}-${w.siblingIndex}`))

            return rootNodes.length > 0 ? rootNodes[0] : null
        }

        const tree = buildTree()
        setTreeData(tree)
    }, [writings])

    // 컨테이너 중앙에 트리 배치
    useEffect(() => {
        const dimensions = document.getElementById('treeWrapper')?.getBoundingClientRect()
        if (dimensions) {
            setTranslate({
                x: dimensions.width / 2,
                y: 50
            })
        }
    }, [])

    const handleNodeClick = (nodeData) => {
        if (onNodeClick) {
            onNodeClick(nodeData.data)
        }
    }

    // 커스텀 노드 렌더링
    const renderCustomNode = ({ nodeDatum, toggleNode }) => (
        <g>
            <circle
                r={20}
                fill={nodeDatum.attributes?.color || '#4A90E2'}
                stroke={currentVersion?.depth === nodeDatum.attributes?.depth && 
                        currentVersion?.siblingIndex === nodeDatum.attributes?.siblingIndex
                        ? '#FFD700' : '#333'}
                strokeWidth={currentVersion?.depth === nodeDatum.attributes?.depth && 
                             currentVersion?.siblingIndex === nodeDatum.attributes?.siblingIndex
                             ? 3 : 1}
                onClick={() => handleNodeClick(nodeDatum)}
                style={{ cursor: 'pointer' }}
            />
            <text
                fill="white"
                fontSize="12"
                fontWeight="bold"
                textAnchor="middle"
                alignmentBaseline="middle"
                onClick={() => handleNodeClick(nodeDatum)}
                style={{ cursor: 'pointer' }}
            >
                {nodeDatum.name}
            </text>
            <text
                fill="#333"
                fontSize="10"
                textAnchor="middle"
                alignmentBaseline="middle"
                y={35}
            >
                {nodeDatum.attributes?.author?.split('@')[0]}
            </text>
        </g>
    )

    if (!treeData) {
        return (
            <div className="flex items-center justify-center h-64 text-gray-500">
                버전 내역이 없습니다
            </div>
        )
    }

    return (
        <div id="treeWrapper" className="w-full h-full" style={{ minHeight: '400px' }}>
            <Tree
                data={treeData}
                translate={translate}
                orientation="vertical"
                pathFunc="step"
                nodeSize={{ x: 150, y: 100 }}
                separation={{ siblings: 1.5, nonSiblings: 2 }}
                renderCustomNodeElement={renderCustomNode}
                zoom={0.8}
                draggable
                collapsible={false}
                enableLegacyTransitions
            />
            
            {/* 범례 */}
            <div className="absolute bottom-4 left-4 bg-white p-3 rounded-lg shadow-md">
                <div className="text-xs font-semibold mb-2">버전 정보</div>
                <div className="text-xs text-gray-600">
                    <div className="flex items-center gap-2 mb-1">
                        <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
                        <span>현재 선택된 버전</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                        <span>다른 버전 (클릭하여 보기)</span>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default VersionTree