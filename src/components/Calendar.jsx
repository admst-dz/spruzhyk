import React, { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { easing } from 'maath'
import { useConfigurator } from '../store'
import { Decal, useTexture } from '@react-three/drei'

export function Calendar(props) {
    const { coverColor, spiralColor, logoTexture } = useConfigurator()

    const baseMat = useRef()
    const spiralMat = useRef()

    useFrame((state, delta) => {
        if(baseMat.current) easing.dampC(baseMat.current.color, coverColor, 0.25, delta)
        if(spiralMat.current) easing.dampC(spiralMat.current.color, spiralColor, 0.25, delta)
    })

    const logoMap = useTexture(logoTexture || '/vite.svg')

    return (
        <group {...props} dispose={null} rotation={[0, -0.5, 0]}>
            {/*
         ГЕОМЕТРИЯ КАЛЕНДАРЯ ("Домик")
         Мы используем призму (Cylinder с 3 гранями) для основания
      */}

            {/* 1. Основа (Подставка) */}
            <mesh rotation={[0, 0, Math.PI / 2]} position={[0, 0, 0]} castShadow receiveShadow>
                {/* radiusTop, radiusBottom, height, segments */}
                <cylinderGeometry args={[1, 1, 2.5, 3, 1]} />
                <meshStandardMaterial ref={baseMat} color={coverColor} roughness={0.6} />

                {/* Логотип на лицевой стороне подставки */}
                {logoTexture && (
                    <Decal
                        position={[0.5, 0, 0.6]} // Подбираем грань
                        rotation={[0, 0, -Math.PI / 3]} // Поворачиваем под наклоном грани
                        scale={[0.6, 0.6, 1]}
                        map={logoMap}
                    />
                )}
            </mesh>

            {/* 2. Бумажный блок (лежит на одной грани) */}
            <mesh position={[0, 0.16, 0.43]} rotation={[-Math.PI / 6, 0, 0]}>
                <boxGeometry args={[2.3, 1.4, 0.05]} />
                <meshStandardMaterial color="#ffffff" roughness={0.8} />
            </mesh>

            {/* 3. Пружина (Сверху) */}
            <mesh position={[0, 0.85, 0]} rotation={[0, 0, Math.PI / 2]}>
                <cylinderGeometry args={[0.08, 0.08, 2.4, 16]} />
                <meshStandardMaterial ref={spiralMat} color={spiralColor} metalness={0.7} roughness={0.2} />
            </mesh>

        </group>
    )
}