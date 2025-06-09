import React, { useState, useEffect, useMemo } from 'react';
import Tree from 'react-d3-tree';

/**
 * 글의 버전 기록을 이진 트리 형태로 시각화하는 컴포넌트입니다.
 * @param {Array<object>} writings - 버전 정보를 담은 WritingDto 배열
 * @param {function} onNodeClick - 트리 노드 클릭 시 호출될 콜백 함수
 * @param {object} currentVersion - 현재 선택된 버전의 WritingDto
 */
const VersionTree = ({ writings = [], onNodeClick, currentVersion = null }) => {
    const [treeData, setTreeData] = useState(null);
    const [translate, setTranslate] = useState({ x: 0, y: 0 });

    // WritingDto 배열을 d3-tree가 요구하는 형식으로 변환합니다.
    useEffect(() => {
        if (writings.length === 0) return;

        const buildTree = () => {
            const nodeMap = new Map();
            
            writings.forEach(writing => {
                const key = `${writing.depth}-${writing.siblingIndex}`;
                nodeMap.set(key, {
                    name: `v${writing.depth}.${writing.siblingIndex}`,
                    attributes: {
                        author: writing.username,
                        time: new Date(writing.time).toLocaleString(),
                        color: writing.color || '#000',
                    },
                    children: [],
                    // 원본 writing 데이터를 노드에 포함시켜 클릭 시 전달합니다.
                    data: writing 
                });
            });

            writings.forEach(writing => {
                if (writing.depth > 0 && writing.parentSiblingIndex !== undefined) {
                    const parentKey = `${writing.depth - 1}-${writing.parentSiblingIndex}`;
                    const childKey = `${writing.depth}-${writing.siblingIndex}`;
                    
                    const parent = nodeMap.get(parentKey);
                    const child = nodeMap.get(childKey);
                    
                    if (parent && child) {
                        parent.children.push(child);
                    }
                }
            });

            const rootNodes = writings
                .filter(w => w.depth === 0)
                .map(w => nodeMap.get(`${w.depth}-${w.siblingIndex}`));

            // 루트가 여러 개일 경우를 대비해 가상의 루트를 만들 수 있지만, 여기서는 첫 번째를 사용합니다.
            return rootNodes.length > 0 ? rootNodes[0] : null;
        };

        const tree = buildTree();
        setTreeData(tree);
    }, [writings]);

    // 컨테이너 중앙에 트리를 배치하기 위한 좌표 계산
    useEffect(() => {
        const dimensions = document.getElementById('treeWrapper')?.getBoundingClientRect();
        if (dimensions) {
            setTranslate({ x: dimensions.width / 2, y: 50 });
        }
    }, []);

    // 노드 클릭 시 상위 컴포넌트로 데이터 전달
    const handleNodeClick = (nodeData) => {
        if (onNodeClick && nodeData.data) {
            onNodeClick(nodeData.data);
        }
    };
    
    // 현재 선택된 버전인지 확인하는 함수
    const isCurrentNode = (nodeDatum) => {
        if (!currentVersion || !nodeDatum.data) return false;
        return currentVersion.depth === nodeDatum.data.depth && 
               currentVersion.siblingIndex === nodeDatum.data.siblingIndex;
    };

    // 커스텀 노드 렌더링
    const renderCustomNode = ({ nodeDatum }) => (
        <g onClick={() => handleNodeClick(nodeDatum)} style={{ cursor: 'pointer' }}>
            <circle
                r={20}
                fill={isCurrentNode(nodeDatum) ? '#f59e0b' : (nodeDatum.attributes?.color || '#4A90E2')}
                stroke={isCurrentNode(nodeDatum) ? '#b45309' : '#333'}
                strokeWidth={isCurrentNode(nodeDatum) ? 4 : 1.5}
            />
            <text
                fill="white"
                stroke="white"
                strokeWidth="0.5px"
                fontSize="12"
                fontWeight="bold"
                textAnchor="middle"
                dy=".3em" // 텍스트 수직 중앙 정렬
            >
                {nodeDatum.name}
            </text>
            <text
                fill="#333"
                fontSize="10"
                textAnchor="middle"
                dy="3.5em"
            >
                {nodeDatum.attributes?.author?.split('@')[0]}
            </text>
        </g>
    );

    if (!treeData) {
        return <div className="text-center text-gray-500">버전 내역이 없습니다.</div>;
    }

    return (
        <div id="treeWrapper" className="w-full h-full" style={{ minHeight: '400px' }}>
            <Tree
                data={treeData}
                translate={translate}
                orientation="vertical"
                pathFunc="step"
                nodeSize={{ x: 120, y: 80 }}
                separation={{ siblings: 1.2, nonSiblings: 1.5 }}
                renderCustomNodeElement={renderCustomNode}
                zoomable={true}
                draggable={true}
                collapsible={false}
                enableLegacyTransitions
            />
        </div>
    );
};

export default VersionTree;
