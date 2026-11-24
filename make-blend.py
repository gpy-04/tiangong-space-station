import bpy,math
from pathlib import Path
from mathutils import Vector
p=Path(__file__).parent
bpy.ops.wm.read_factory_settings(use_empty=True)
bpy.ops.import_scene.gltf(filepath=str(p/'中国空间站_三舱与舱内设施.glb'))
scene=bpy.context.scene;scene.unit_settings.system='METRIC';scene.unit_settings.scale_length=1
world=bpy.data.worlds.new('Orbital darkness');world.use_nodes=True;world.node_tree.nodes['Background'].inputs['Color'].default_value=(.015,.025,.05,1);world.node_tree.nodes['Background'].inputs['Strength'].default_value=.35;scene.world=world
light_data=bpy.data.lights.new('Sun / sunlight','SUN');light_data.energy=3;light_data.angle=math.radians(.53);light=bpy.data.objects.new('Sun / sunlight',light_data);scene.collection.objects.link(light);light.rotation_euler=Vector((-35,32,-58)).to_track_quat('-Z','Y').to_euler()
fill_data=bpy.data.lights.new('Earth reflected light','AREA');fill_data.energy=4200;fill_data.shape='DISK';fill_data.size=45;fill=bpy.data.objects.new('Earth reflected light',fill_data);scene.collection.objects.link(fill);fill.location=(0,0,-12)
camera_data=bpy.data.cameras.new('Overview camera');camera=bpy.data.objects.new('Overview camera',camera_data);scene.collection.objects.link(camera);camera.location=(43,-58,31);target=Vector((0,-3,0));camera.rotation_euler=(target-camera.location).to_track_quat('-Z','Y').to_euler();camera_data.lens=43;camera_data.clip_end=1000;scene.camera=camera
scene.render.engine='CYCLES';scene.cycles.samples=32;scene.render.resolution_x=1600;scene.render.resolution_y=1000;scene.render.resolution_percentage=100
scene.view_settings.view_transform='AgX'
for i,(x,y,z) in enumerate([(0,.78,2.8),(0,.78,5.1),(0,.95,8.8),(0,.95,11.5),(-5,.95,0),(-8,.95,0),(-10.8,.95,0),(5,.95,0),(8,.95,0),(10.8,.95,0)]):
 lamp_data=bpy.data.lights.new('Cabin light '+str(i+1),'POINT');lamp_data.energy=28;lamp_data.color=(.94,.97,1);lamp_data.shadow_soft_size=.18
 lamp=bpy.data.objects.new(lamp_data.name,lamp_data);scene.collection.objects.link(lamp);lamp.location=(x,-z,y)
for name,position,target_point in [('医监用品',(.10,-12.15,.22),(1.27,-12.7,0)),('睡眠与卫生区',(0,-6.35,.40),(0,-2.1,-.18)),('独立睡眠舱',(.08,-6.04,.20),(-.77,-5.1,-.14)),('餐饮与厨房',(.18,-10.85,.22),(-1.15,-9.5,-.1)),('锻炼设备',(.10,-10.95,.24),(-.88,-12.22,-.55)),('天和舱内',(0,-7.9,.1),(0,-12.6,0)),('问天实验舱内',(-4.1,0,.05),(-11.9,0,0)),('梦天实验舱内',(4.1,0,.05),(11.9,0,0))]:
 data=bpy.data.cameras.new(name);obj=bpy.data.objects.new(name,data);scene.collection.objects.link(obj);obj.location=position;obj.rotation_euler=(Vector(target_point)-obj.location).to_track_quat('-Z','Y').to_euler();data.lens=24;data.clip_start=.035
for a in bpy.context.screen.areas:
 if a.type=='VIEW_3D':a.spaces.active.region_3d.view_perspective='CAMERA'
scene['source']='CMSE full configuration photograph, 2023-10-30, reference page dated 2023-11-28'
scene['representation']='Educational reconstruction; interior layout, shell thickness and hidden systems are illustrative.'
bpy.ops.file.pack_all()
bpy.ops.wm.save_as_mainfile(filepath=str(p/'中国空间站_精细可编辑.blend'))
print('Saved editable Blender scene with packed GLB textures.')
